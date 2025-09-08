export function convertValue(value) {
  if (!value) return value;
  if (value._bsontype === 'ObjectId') return value.toString();
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(convertValue);
  if (typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = convertValue(v);
    return out;
  }
  return value;
}

export function docToJson(doc) {
  if (!doc) return doc;
  return convertValue(doc);
}

export function docsToJson(docs) {
  return Array.from(docs).map(docToJson);
}



