'use strict';

const path = require('path');
const fs = require('fs');
const nodeHtmlParser = require('node-html-parser');
const toml = require('@iarna/toml');
const consola = require('consola');
const defu = require('defu');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

const consola__default = /*#__PURE__*/_interopDefaultLegacy(consola);
const defu__default = /*#__PURE__*/_interopDefaultLegacy(defu);

var name = "@nuxtjs/netlify-files";
var version = "1.2.0";

const logger = consola__default['default'].withTag("nuxt:netlify-files");
const CONFIG_KEY = "netlifyFiles";
const HEADERS_FILE_NAME = "_headers";
const REDIRECTS_FILE_NAME = "_redirects";
const TOML_FILE_NAME = "netlify.toml";
const FILE_NAMES = [HEADERS_FILE_NAME, REDIRECTS_FILE_NAME, TOML_FILE_NAME];
const nuxtModule = function(moduleOptions) {
  const DEFAULTS = {
    copyExistingFiles: true,
    detectForms: false,
    existingFilesDirectory: this.options.srcDir,
    netlifyToml: void 0
  };
  const options = defu__default['default'](this.options["netlify-files"], this.options[CONFIG_KEY], moduleOptions, DEFAULTS);
  const forms = [];
  if (options.detectForms) {
    this.nuxt.hook("generate:page", function({html}) {
      forms.push(...nodeHtmlParser.parse(html).querySelectorAll("form").filter((form) => {
        return form.getAttribute("netlify") === "" || form.getAttribute("netlify") === "true" || form.getAttribute("data-netlify") === "" || form.getAttribute("data-netlify") === "true";
      }));
    });
  }
  this.nuxt.hook("generate:done", async () => {
    const filesToCopy = options.netlifyToml ? FILE_NAMES.filter((file) => file !== TOML_FILE_NAME) : FILE_NAMES;
    await programmaticallyCreateToml.bind(this)(options);
    copyExistingNetlifyFiles.bind(this)(options, filesToCopy);
    generatePageWithForms.bind(this)(options, forms);
  });
};
async function programmaticallyCreateToml({netlifyToml}) {
  if (!netlifyToml) {
    return;
  }
  const tomlObject = typeof netlifyToml === "function" ? await netlifyToml() : netlifyToml;
  if (typeof tomlObject !== "object") {
    throw new TypeError("`netlifyToml` must be an object, or a function that returns an object");
  }
  const toml$1 = toml.stringify(tomlObject);
  const destination = path.resolve(this.options.rootDir, this.options.generate.dir, TOML_FILE_NAME);
  fs.writeFileSync(destination, toml$1);
}
function copyExistingNetlifyFiles({existingFilesDirectory, copyExistingFiles}, filesToCopy) {
  if (!copyExistingFiles) {
    return;
  }
  filesToCopy.forEach((name2) => {
    const origin = path.resolve(existingFilesDirectory, name2);
    const destination = path.resolve(this.options.rootDir, this.options.generate.dir, name2);
    const isAvailable = fs.existsSync(origin);
    if (!isAvailable) {
      logger.warn(`No \`${name2}\` file found in \`${existingFilesDirectory}\`.`);
      return;
    }
    fs.copyFileSync(origin, destination);
  });
}
function generatePageWithForms({detectForms}, forms) {
  if (!detectForms) {
    return;
  }
  const destination = path.resolve(this.options.rootDir, this.options.generate.dir, "_netlify-forms.html");
  const content = forms.map((form) => form.toString()).join("").trim();
  if (content) {
    fs.writeFileSync(destination, content);
  }
}
nuxtModule.meta = {name, version};

module.exports = nuxtModule;
