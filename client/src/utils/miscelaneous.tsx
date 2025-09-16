
export const replaceJSX = (subject: any, find: any, replace: any, keyPrefix = '') => {
  let result: any[] = [];
  
  if (Array.isArray(subject)) {
    for (let i = 0; i < subject.length; i++) {
      result = [...result, replaceJSX(subject[i], find, replace, `${keyPrefix}-${i}`)];
    }
    return result;
  } else if (typeof subject !== 'string') {
    return subject;
  }
  
  const parts = subject.split(find);
  
  for (let i = 0; i < parts.length; i++) {
    result.push(<span key={`${keyPrefix}-${i}`}>{parts[i]}</span>);
    
    if (i + 1 !== parts.length) {
      result.push(<span key={`${keyPrefix}-replace-${i}`}>{replace}</span>);
    }
  }

  return result;
};

export const replaceJSXRecursive = (subject: any, replacements: Record<string, any>) => {
  const keys = Object.keys(replacements || {}).filter((k) => k.length > 0);
  if (keys.length === 0) return subject;

  const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const makeParts = (text: string, keyPrefix = "replace"): any[] => {
    const sorted = keys.slice().sort((a, b) => b.length - a.length);
    const pattern = sorted.map(escapeRegExp).join("|");
    const regex = new RegExp(`(${pattern})`, "g");
    const pieces = text.split(regex);

    const result: any[] = [];
    let replaceIndex = 0;

    for (let i = 0; i < pieces.length; i++) {
      const piece = pieces[i];
      if (piece === undefined) continue;

      if ((replacements as any).hasOwnProperty(piece)) {
        result.push(<span key={`${keyPrefix}-replace-${replaceIndex}`}>{replacements[piece]}</span>);
        replaceIndex++;
      } else {
        result.push(<span key={`${keyPrefix}-${i}`}>{piece}</span>);
      }
    }

    return result;
  };

  const traverse = (node: any, prefix = "replace"): any => {
    if (Array.isArray(node)) {
      const arr: any[] = [];
      node.forEach((child, idx) => {
        const res = traverse(child, `${prefix}-${idx}`);
        if (Array.isArray(res)) {
          arr.push(...res);
        } else {
          arr.push(res);
        }
      });
      return arr;
    }

    if (typeof node === "string") {
      return makeParts(node, prefix);
    }

    // Do not deep-traverse into React elements or other objects per instruction
    return node;
  };

  return traverse(subject, "replace");
};
