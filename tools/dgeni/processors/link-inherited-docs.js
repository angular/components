const ts = require('typescript');

module.exports = function linkInheritedDocs(readTypeScriptModules, tsParser) {

  let checker = null;

  return {
    $runAfter: ['readTypeScriptModules'],
    $runBefore: ['categorizer'],
    $process: processDocs,
  };

  function processDocs(docs) {
    // Use the configuration from the `readTypeScriptModules` processor.
    let {sourceFiles, basePath} = readTypeScriptModules;

    // To be able to map the TypeScript Nodes to the according symbols we need to use the same
    // TypeScript configuration as in the `readTypeScriptModules` processor.
    checker = tsParser.parse(sourceFiles, basePath).typeChecker;

    // Iterate through all class docs and resolve the inherited docs.
    docs.filter(doc => doc.docType === 'class').forEach(classDoc => visitClassDoc(classDoc, docs));
  }

  function visitClassDoc(classDoc, docs) {
    let inheritedType = resolveInheritedType(classDoc.exportSymbol);
    let inheritedSymbol = inheritedType && inheritedType.symbol;

    if (inheritedSymbol) {
      classDoc.inheritedSymbol = inheritedSymbol;
      classDoc.inheritedDoc = docs.find(doc => doc.exportSymbol === inheritedSymbol);
    }
  }

  function resolveInheritedType(classSymbol) {
    if (classSymbol.flags & ~ts.SymbolFlags.Class) {
      return;
    }

    let declaration = classSymbol.valueDeclaration || classSymbol.declarations[0];
    let typeExpression = ts.getClassExtendsHeritageClauseElement(declaration);

    return typeExpression ? checker.getTypeAtLocation(typeExpression) : null;
  }
};
