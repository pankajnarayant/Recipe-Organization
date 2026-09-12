import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'smartplate_db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-memory state
let db = {
  users: [],
  recipes: [],
  mealplans: [],
  shoppinglistitems: [],
};

// Load initial database from disk if available
export const loadDatabase = () => {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      db = JSON.parse(raw);
    } else {
      saveDatabase();
    }
  } catch (err) {
    console.error('[Fallback DB] Failed to load database file, starting fresh:', err);
    saveDatabase();
  }
};

// Immediately load synchronously on import
loadDatabase();


// Persist database to disk
export const saveDatabase = () => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Fallback DB] Error persisting database:', err);
  }
};

// Generate ObjectId-like 24 character hex strings
export const generateId = () => {
  const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');
  const random = Array.from({ length: 16 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
  return timestamp + random;
};

// Helper to extract nested value or array of values for queries like 'meals._id'
const getNestedValue = (obj, path) => {
  if (!obj) return undefined;
  if (!path.includes('.')) return obj[path];
  const parts = path.split('.');
  let current = obj;
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (Array.isArray(current)) {
      const rest = parts.slice(i).join('.');
      return current.map((item) => getNestedValue(item, rest)).flat().filter(Boolean);
    }
    current = current[part];
    if (current === undefined) return undefined;
  }
  return current;
};

// Helper for matching queries
const matchesFilter = (item, query) => {
  for (const key of Object.keys(query)) {
    if (key === '$or') {
      const matched = query.$or.some((subQuery) => matchesFilter(item, subQuery));
      if (!matched) return false;
      continue;
    }
    if (key === '$and') {
      const matched = query.$and.every((subQuery) => matchesFilter(item, subQuery));
      if (!matched) return false;
      continue;
    }

    const val = query[key];
    const itemVal = getNestedValue(item, key);

    if (val && typeof val === 'object' && !Array.isArray(val) && !(val instanceof RegExp)) {
      if ('$in' in val) {
        if (Array.isArray(itemVal)) {
          if (!val.$in.some((v) => itemVal.map(String).includes(v.toString()))) return false;
        } else {
          if (!val.$in.map(String).includes(itemVal?.toString())) return false;
        }
      }
      if ('$lte' in val) {
        if (!(itemVal <= val.$lte)) return false;
      }
      if ('$gte' in val) {
        if (!(itemVal >= val.$gte)) return false;
      }
    } else if (val instanceof RegExp) {
      if (typeof itemVal !== 'string' || !val.test(itemVal)) return false;
    } else {
      const targetVal = val ? val.toString() : '';
      if (Array.isArray(itemVal)) {
        if (!itemVal.map(String).includes(targetVal)) return false;
      } else {
        const sItem = itemVal ? itemVal.toString() : '';
        if (sItem !== targetVal) return false;
      }
    }
  }
  return true;
};


// Mock Query chaining implementation (sort, skip, limit, populate, select)
class MockQuery {
  constructor(items, collectionName, isSingle = false) {
    this.items = items ? items.map((i) => ({ ...i })) : [];
    this.collectionName = collectionName;
    this.isSingle = isSingle;
  }

  populate(pathOrOptions, select) {
    let path = typeof pathOrOptions === 'string' ? pathOrOptions : pathOrOptions?.path;

    if (path === 'owner') {
      this.items = this.items.map((item) => {
        const ownerId = item.owner?._id || item.owner;
        const owner = db.users.find((u) => u._id.toString() === ownerId?.toString());
        return {
          ...item,
          owner: owner ? { _id: owner._id, name: owner.name, email: owner.email } : item.owner,
        };
      });
    } else if (path === 'favorites') {
      this.items = this.items.map((item) => {
        const favIds = (item.favorites || []).map((f) => (f._id || f).toString());
        const favRecipes = db.recipes.filter((r) => favIds.includes(r._id.toString()));
        return {
          ...item,
          favorites: favRecipes.map((r) => {
            const ownerId = r.owner?._id || r.owner;
            const owner = db.users.find((u) => u._id.toString() === ownerId?.toString());
            return {
              ...r,
              owner: owner ? { _id: owner._id, name: owner.name, email: owner.email } : r.owner,
            };
          }),
        };
      });
    } else if (path === 'meals.recipe') {
      this.items = this.items.map((item) => {
        if (!item.meals) return item;
        return {
          ...item,
          meals: item.meals.map((meal) => {
            const recipeId = meal.recipe?._id || meal.recipe;
            const recipe = db.recipes.find(
              (r) => r._id.toString() === recipeId?.toString()
            );
            return {
              ...meal,
              recipe: recipe || meal.recipe,
            };
          }),
        };
      });
    }
    return this;
  }

  sort(sortObj) {
    const key = Object.keys(sortObj)[0];
    const dir = sortObj[key];
    if (key) {
      this.items.sort((a, b) => {
        if (a[key] < b[key]) return dir === 1 ? -1 : 1;
        if (a[key] > b[key]) return dir === 1 ? 1 : -1;
        return 0;
      });
    }
    return this;
  }

  skip(num) {
    this.items = this.items.slice(num);
    return this;
  }

  limit(num) {
    this.items = this.items.slice(0, num);
    return this;
  }

  select(fields) {
    return this;
  }

  async exec() {
    if (this.isSingle) {
      const doc = this.items[0];
      return doc ? wrapDocument(doc, this.collectionName) : null;
    }
    return this.items.map((doc) => wrapDocument(doc, this.collectionName));
  }

  then(resolve, reject) {
    return this.exec().then(resolve, reject);
  }
}

// Wrap object with mongoose-like .save() and .matchPassword()
export const wrapDocument = (doc, collectionName) => {
  if (!doc) return null;
  const wrapped = { ...doc };

  wrapped.save = async function () {
    this.updatedAt = new Date().toISOString();
    const idx = db[collectionName].findIndex((d) => d._id.toString() === this._id.toString());
    if (idx > -1) {
      db[collectionName][idx] = { ...this };
    } else {
      db[collectionName].push({ ...this });
    }
    saveDatabase();
    return wrapDocument(db[collectionName].find((d) => d._id.toString() === this._id.toString()), collectionName);
  };

  wrapped.deleteOne = async function () {
    db[collectionName] = db[collectionName].filter((d) => d._id.toString() !== this._id.toString());
    saveDatabase();
    return true;
  };

  if (collectionName === 'users') {
    wrapped.matchPassword = async function (enteredPassword) {
      return await bcrypt.compare(enteredPassword, this.password);
    };
  }

  return wrapped;
};

// Create a Model Facade
export const createModelFacade = (collectionName, mongooseModel) => {
  function Model(data = {}) {
    if (global.isMongoConnected && mongooseModel) {
      return new mongooseModel(data);
    }
    const item = {
      ...data,
      _id: data._id || generateId(),
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: data.updatedAt || new Date().toISOString(),
    };
    return wrapDocument(item, collectionName);
  }

  Model.find = function (query = {}) {
    if (global.isMongoConnected && mongooseModel) {
      return mongooseModel.find(query);
    }
    const matched = db[collectionName].filter((item) => matchesFilter(item, query));
    return new MockQuery(matched, collectionName, false);
  };

  Model.findOne = function (query = {}) {
    if (global.isMongoConnected && mongooseModel) {
      return mongooseModel.findOne(query);
    }
    const item = db[collectionName].find((item) => matchesFilter(item, query));
    return new MockQuery(item ? [item] : [], collectionName, true);
  };

  Model.findById = function (id) {
    if (global.isMongoConnected && mongooseModel) {
      return mongooseModel.findById(id);
    }
    const item = db[collectionName].find((d) => d._id.toString() === id.toString());
    return new MockQuery(item ? [item] : [], collectionName, true);
  };



  Model.create = async function (data) {
    if (global.isMongoConnected && mongooseModel) {
      return mongooseModel.create(data);
    }
    const item = { ...data };
    item._id = item._id || generateId();
    item.createdAt = new Date().toISOString();
    item.updatedAt = new Date().toISOString();

    // If user model, hash password
    if (collectionName === 'users' && item.password) {
      const salt = await bcrypt.genSalt(10);
      item.password = await bcrypt.hash(item.password, salt);
      item.favorites = item.favorites || [];
    }

    db[collectionName].push(item);
    saveDatabase();
    return wrapDocument(item, collectionName);
  };

  Model.insertMany = async function (items) {
    if (global.isMongoConnected && mongooseModel) {
      return mongooseModel.insertMany(items);
    }
    const created = items.map((data) => ({
      ...data,
      _id: data._id || generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    db[collectionName].push(...created);
    saveDatabase();
    return created.map((c) => wrapDocument(c, collectionName));
  };

  Model.findByIdAndUpdate = function (id, updateData, options = {}) {
    if (global.isMongoConnected && mongooseModel) {
      return mongooseModel.findByIdAndUpdate(id, updateData, options);
    }
    const idx = db[collectionName].findIndex((d) => d._id.toString() === id.toString());
    if (idx === -1) return new MockQuery([], collectionName, true);

    db[collectionName][idx] = {
      ...db[collectionName][idx],
      ...updateData,
      updatedAt: new Date().toISOString(),
    };
    saveDatabase();
    const item = db[collectionName][idx];
    return new MockQuery([item], collectionName, true);
  };


  Model.findByIdAndDelete = async function (id) {
    if (global.isMongoConnected && mongooseModel) {
      return mongooseModel.findByIdAndDelete(id);
    }
    const item = db[collectionName].find((d) => d._id.toString() === id.toString());
    db[collectionName] = db[collectionName].filter((d) => d._id.toString() !== id.toString());
    saveDatabase();
    return item;
  };

  Model.deleteMany = async function (query = {}) {
    if (global.isMongoConnected && mongooseModel) {
      return mongooseModel.deleteMany(query);
    }
    const beforeCount = db[collectionName].length;
    if (Object.keys(query).length === 0) {
      db[collectionName] = [];
    } else {
      db[collectionName] = db[collectionName].filter((item) => !matchesFilter(item, query));
    }
    const deletedCount = beforeCount - db[collectionName].length;
    saveDatabase();
    return { deletedCount };
  };

  Model.countDocuments = async function (query = {}) {
    if (global.isMongoConnected && mongooseModel) {
      return mongooseModel.countDocuments(query);
    }
    return db[collectionName].filter((item) => matchesFilter(item, query)).length;
  };

  Model.updateMany = async function (query, updateOp) {
    if (global.isMongoConnected && mongooseModel) {
      return mongooseModel.updateMany(query, updateOp);
    }
    // Simple pull / set support
    if (updateOp.$pull) {
      for (const key of Object.keys(updateOp.$pull)) {
        const valToRemove = updateOp.$pull[key].toString();
        db[collectionName].forEach((item) => {
          if (Array.isArray(item[key])) {
            item[key] = item[key].filter((id) => (id._id || id).toString() !== valToRemove);
          }
        });
      }
    }
    saveDatabase();
    return { modifiedCount: 1 };
  };

  return Model;
};

