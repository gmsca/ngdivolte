import { SchematicsException, Tree } from '@angular-devkit/schematics';
import { addImportToModule } from 'schematics-utilities/dist/angular/ast-utils';
import { InsertChange } from 'schematics-utilities/dist/angular/change';
import { getSourceFile } from 'schematics-utilities/dist/material/ast';
import { readIntoSourceFile } from 'schematics-utilities/dist/material/build-component';
import { tsquery } from '@phenomnomnominal/tsquery';

export function doAddImportToModule(
  host: Tree,
  modulePath: string,
  moduleName: string,
  src: string
) {
  const moduleSource = getSourceFile(host, modulePath);

  if (!moduleSource) {
    throw new SchematicsException(`Module not found: ${modulePath}`);
  }

  const change = addImportToModule(moduleSource, modulePath, moduleName, src);
  const recorder = host.beginUpdate(modulePath);
  change.forEach(item => {
    if (item instanceof InsertChange) {
      recorder.insertLeft(item.pos, item.toAdd);
    }
  });

  host.commitUpdate(recorder);
}

export function InsertCodeToTsFile(
  host: Tree,
  ComponentPath: string,
  content: string
) {
  const recorder = host.beginUpdate(ComponentPath);

  if (
    tsquery(
      readIntoSourceFile(host, ComponentPath),
      'Identifier[name="enableClickstream"]'
    ).length == 0
  ) {
    let insertPos =
      tsquery(
        readIntoSourceFile(host, ComponentPath),
        'IfStatement:has(Identifier[name="enableProdMode"]) > Block'
      )[0].end - 1;
    let change = new InsertChange(ComponentPath, insertPos, content);

    if (change instanceof InsertChange) {
      recorder.insertLeft(change.pos, change.toAdd);
    }

    host.commitUpdate(recorder);
  }
}
export function insertDivolteToEnv(
  host: Tree,
  ComponentPath: string,
  content: string
) {
  const recorder = host.beginUpdate(ComponentPath);

  if (
    tsquery(
      readIntoSourceFile(host, ComponentPath),
      'Identifier[name="divolteUrl"]'
    ).length == 0
  ) {
    let insertPos =
      tsquery(
        readIntoSourceFile(host, ComponentPath),
        'VariableDeclaration:has(Identifier[name="environment"]) > ObjectLiteralExpression'
      )[0].pos + 2;
    let change = new InsertChange(ComponentPath, insertPos, content);

    if (change instanceof InsertChange) {
      recorder.insertLeft(change.pos, change.toAdd);
    }

    host.commitUpdate(recorder);
  }
}

export function AppendCodeToTsFile(
  host: Tree,
  ComponentPath: string,
  appendContentValue: string
) {
  const recorder = host.beginUpdate(ComponentPath);

  if (
    tsquery(
      readIntoSourceFile(host, ComponentPath),
      'Identifier[name="divoltejs"]'
    ).length == 0
  ) {
    let insertPos = tsquery(
      readIntoSourceFile(host, ComponentPath),
      'EndOfFileToken'
    )[0].end;
    let change = new InsertChange(ComponentPath, insertPos, appendContentValue);

    if (change instanceof InsertChange) {
      recorder.insertLeft(change.pos, change.toAdd);
    }

    host.commitUpdate(recorder);
  }
}
