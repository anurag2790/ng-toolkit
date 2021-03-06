import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { getFileContent } from '@schematics/angular/utility/test';
import { isString } from 'util';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';

export function createGitIgnore(dirName: string): Rule {
    return (tree => {
        createOrOverwriteFile(tree, `./${dirName}/.gitignore`, `/node_modules/
/dist/
/lib/
/yarn.lock
*.log
.idea
.serverless
*.iml
*.js.map
*.d.ts
.DS_Store
dll
.awcache
/src/styles/main.css
/firebug-lite
firebug-lite.tar.tgz
serverless.yml
/coverage`);
        return tree;
    });
}

export function createOrOverwriteFile(tree: Tree, filePath: string, fileContent: string): void {
    if (!tree.exists(filePath)) {
        tree.create(filePath, '');
    }
    tree.overwrite(filePath, fileContent);
}

export function addDependenciesToPackageJson(options: any, dependencies: {name: string, version:string, dev: boolean}[]): Rule {
    return (tree: Tree, context: SchematicContext) => {
        const packageJsonSource = JSON.parse(getFileContent(tree, `${options.directory}/package.json`));

        dependencies.forEach(entry => {
            if (!entry.dev) {
                packageJsonSource.dependencies[entry.name] = entry.version;
            }
            if (entry.dev) {
                packageJsonSource.devDependencies[entry.name] = entry.version;
            }
        })

        tree.overwrite(`${options.directory}/package.json`, JSON.stringify(packageJsonSource, null, "  "));

        context.addTask(new NodePackageInstallTask(options.directory))

        return tree;
    }
}

export function addDependencyToPackageJson(options: any, name: string, version: string, dev: boolean = false): Rule {
    return (tree: Tree) => {
        const packageJsonSource = JSON.parse(getFileContent(tree, `${options.directory}/package.json`));

        if (!dev) {
            packageJsonSource.dependencies[name] = version;
        }
        if (dev) {
            packageJsonSource.devDependencies[name] = version;
        }

        tree.overwrite(`${options.directory}/package.json`, JSON.stringify(packageJsonSource, null, "  "));

        return tree;
    }
}

export function addOrReplaceScriptInPackageJson(options: any, name: string, script: string): Rule {
    return tree => {
        const packageJsonSource = JSON.parse(getFileContent(tree, `${options.directory}/package.json`));
        packageJsonSource.scripts[name] = script;
        tree.overwrite(`${options.directory}/package.json`, JSON.stringify(packageJsonSource, null, "  "));
        return tree;
    }
}

export function addEntryToEnvironment(tree: Tree, filePath: string, entryName: string, entryValue: any): void {
    const sourceText = getFileContent(tree, filePath);
    const changePos =  sourceText.lastIndexOf("};") - 1;
    const changeRecorder = tree.beginUpdate(filePath);
    if (isString(entryValue)) {
        changeRecorder.insertLeft(changePos, `,\n\t${entryName}: '${entryValue}'`);
    } else {
        changeRecorder.insertLeft(changePos, `,\n\t${entryName}: ${entryValue}`);
    }
    tree.commitUpdate(changeRecorder);
}

export function addImportStatement(tree: Tree, filePath: string, importLine: string): void {
    const changeRecorder = tree.beginUpdate(filePath);
    changeRecorder.insertLeft(0, importLine+'\n');
    tree.commitUpdate(changeRecorder);
}
