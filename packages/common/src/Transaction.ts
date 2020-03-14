import Flight from "./Flight";

export default interface Transaction {
  blockId: string;
  id: string;
  timestamp: number;
  content: Flight;
}

export function sortAsExpected(t: Transaction) {
  const orderedContent = {};
  Object.keys(t.content)
    .sort()
    .forEach(key => {
      orderedContent[key] = t.content[key];
    });

  return {
    blockId: t.blockId,
    id: t.id,
    timestamp: t.timestamp,
    content: t.content
  };
}
