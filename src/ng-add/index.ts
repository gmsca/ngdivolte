import { getWorkspace } from '@schematics/angular/utility/config';
import { getAppModulePath } from '@schematics/angular/utility/ng-ast-utils';
import { getPackageJsonDependency } from '@schematics/angular/utility/dependencies';
import { getProjectFromWorkspace } from 'schematics-utilities/dist/material/get-project';
import { Schema } from './schema';
import {
  apply,
  chain,
  mergeWith,
  move,
  renameTemplateFiles,
  Rule,
  SchematicContext,
  template,
  Tree,
  url
} from '@angular-devkit/schematics';
import { normalize } from '@angular-devkit/core';
import {
  doAddImportToModule,
  AppendCodeToTsFile,
  InsertCodeToTsFile,
  insertDivolteToEnv
} from './utility/ast-utils';

export function ngAdd(_options: Schema): Rule {
  return chain([
    editEnvironmentDotTs(_options),
    createDivolteServiceAndInputTracker(_options),
    editMainDotTs(_options),
    editAppModule(_options)
  ]);
}

function editEnvironmentDotTs(_options: Schema): Rule {
  return (host: Tree, context: SchematicContext) => {
    const workspace = getWorkspace(host);
    const project = getProjectFromWorkspace(
      workspace,
      _options.project
        ? _options.project
        : Object.keys(workspace['projects'])[0]
    );

    const environmentDotTsPath = project.sourceRoot
      ? normalize(`${project.sourceRoot}/environments/environment.ts`)
      : 'src/environments/environments.ts';
    const content = `
      divolteUrl: '<your divolte.js location>/divolte.js',
      enableClickstream: true,`;
    insertDivolteToEnv(host, environmentDotTsPath, content);

    context.logger.log('info', `✔️        environment.ts is modified`);

    return host;
  };
}

function createDivolteServiceAndInputTracker(_options: Schema) {
  return (host: Tree, context: SchematicContext) => {
    const workspace = getWorkspace(host);
    const project = getProjectFromWorkspace(
      workspace,
      _options.project
        ? _options.project
        : Object.keys(workspace['projects'])[0]
    );
    const elementName = Object.keys(workspace.projects)[0];
    const sourceTemplate = url('./files');
    const ngCore = getPackageJsonDependency(host, `@angular/core`);
    if (ngCore) {
      let tempArr = ngCore.version.match(/[0-9]+/);
      if (tempArr) {
        _options.ngVersion = Number(tempArr[0]);
      }
    }

    _options.project = elementName;

    const sourceParametrizeTemplate = apply(sourceTemplate, [
      renameTemplateFiles(),
      template({ ..._options }),
      move(
        project.sourceRoot
          ? normalize(`${project.sourceRoot}/${project.prefix}`)
          : 'src/app'
      )
    ]);

    host = mergeWith(sourceParametrizeTemplate)(host, context) as Tree;

    context.logger.log(
      'info',
      `✔️        Generated 'DivolteService' And 'InputTracker'`
    );
    return host;
  };
}

function editMainDotTs(_options: Schema): Rule {
  return (host: Tree, context: SchematicContext) => {
    const workspace = getWorkspace(host);
    const project = getProjectFromWorkspace(
      workspace,
      _options.project
        ? _options.project
        : Object.keys(workspace['projects'])[0]
    );

    const targets = (<any>project).targets || project.architect;
    const mainDotTsPath = normalize(`${targets.build.options.main}`);

    const insertContent = `enableClickstream();`;

    const appendContent = `  
      const divoltejs = document.createElement('script');

      function enableClickstream() {
        environment.enableClickstream = true;
        environment.production = true;
      }

      if (environment.enableClickstream ) {
        divoltejs.setAttribute('src', environment.divolteUrl);
        document.body.appendChild(divoltejs);
      }
    `;
    InsertCodeToTsFile(host, mainDotTsPath, insertContent);
    context.logger.log(
      'info',
      `✔️        insert enableClickstream() to src/main.ts`
    );
    AppendCodeToTsFile(host, mainDotTsPath, appendContent);
    context.logger.log('info', `✔️        insert content to src/main.ts`);

    return host;
  };
}

function editAppModule(_options: Schema): Rule {
  return (host: Tree, context: SchematicContext) => {
    const workspace = getWorkspace(host);
    const project = getProjectFromWorkspace(
      workspace,
      _options.project
        ? _options.project
        : Object.keys(workspace['projects'])[0]
    );

    const targets = (<any>project).targets || project.architect;
    const modulePath = getAppModulePath(host, targets.build.options.main);

    doAddImportToModule(
      host,
      modulePath,
      'InputTrackerModule',
      './shared/input-tracker'
    );
    context.logger.log(
      'info',
      `✔️        InputTrackerModule is imported in src/app/app.module.ts`
    );

    return host;
  };
}
