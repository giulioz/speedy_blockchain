import Flight from "./Flight";

export default interface Transaction {
  id: string;
  timestamp: number;
  content: Flight;
}

export function sortAsExpected(t: Transaction): Transaction {
  const orderedContent = {};
  Object.keys(t.content)
    .sort()
    .forEach(key => {
      orderedContent[key] = t.content[key];
    });

  return {
    id: t.id,
    timestamp: t.timestamp,
    content: t.content
  };
}
