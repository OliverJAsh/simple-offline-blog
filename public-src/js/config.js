System.config({
  baseURL: "/js",
  defaultJSExtensions: true,
  transpiler: "babel",
  babelOptions: {
    "optional": [
      "runtime",
      "optimisation.modules.system"
    ]
  },
  paths: {
    // Relative to root
    "shared/*": "./shared/*",
    "github:*": "jspm_packages/github/*",
    "npm:*": "jspm_packages/npm/*"
  },

  map: {
    "babel": "npm:babel-core@5.8.24",
    "babel-runtime": "npm:babel-runtime@5.8.20",
    "core-js": "npm:core-js@1.1.4",
    "vdom-virtualize": "npm:vdom-virtualize@0.0.13",
    "virtual-dom": "npm:virtual-dom@2.1.1",
    "github:jspm/nodelibs-assert@0.1.0": {
      "assert": "npm:assert@1.3.0"
    },
    "github:jspm/nodelibs-process@0.1.1": {
      "process": "npm:process@0.10.1"
    },
    "github:jspm/nodelibs-util@0.1.0": {
      "util": "npm:util@0.10.3"
    },
    "npm:assert@1.3.0": {
      "util": "npm:util@0.10.3"
    },
    "npm:babel-runtime@5.8.20": {
      "process": "github:jspm/nodelibs-process@0.1.1"
    },
    "npm:core-js@1.1.4": {
      "fs": "github:jspm/nodelibs-fs@0.1.2",
      "process": "github:jspm/nodelibs-process@0.1.1",
      "systemjs-json": "github:systemjs/plugin-json@0.1.0"
    },
    "npm:error@4.4.0": {
      "assert": "github:jspm/nodelibs-assert@0.1.0",
      "camelize": "npm:camelize@1.0.0",
      "string-template": "npm:string-template@0.2.1",
      "xtend": "npm:xtend@4.0.0"
    },
    "npm:ev-store@7.0.0": {
      "individual": "npm:individual@3.0.0"
    },
    "npm:global@4.3.0": {
      "process": "npm:process@0.5.2"
    },
    "npm:inherits@2.0.1": {
      "util": "github:jspm/nodelibs-util@0.1.0"
    },
    "npm:next-tick@0.2.2": {
      "process": "github:jspm/nodelibs-process@0.1.1"
    },
    "npm:util@0.10.3": {
      "inherits": "npm:inherits@2.0.1",
      "process": "github:jspm/nodelibs-process@0.1.1"
    },
    "npm:vdom-virtualize@0.0.13": {
      "virtual-dom": "npm:virtual-dom@2.0.1"
    },
    "npm:virtual-dom@2.0.1": {
      "browser-split": "npm:browser-split@0.0.1",
      "error": "npm:error@4.4.0",
      "ev-store": "npm:ev-store@7.0.0",
      "global": "npm:global@4.3.0",
      "is-object": "npm:is-object@1.0.1",
      "next-tick": "npm:next-tick@0.2.2",
      "x-is-array": "npm:x-is-array@0.1.0",
      "x-is-string": "npm:x-is-string@0.1.0"
    },
    "npm:virtual-dom@2.1.1": {
      "browser-split": "npm:browser-split@0.0.1",
      "error": "npm:error@4.4.0",
      "ev-store": "npm:ev-store@7.0.0",
      "global": "npm:global@4.3.0",
      "is-object": "npm:is-object@1.0.1",
      "next-tick": "npm:next-tick@0.2.2",
      "x-is-array": "npm:x-is-array@0.1.0",
      "x-is-string": "npm:x-is-string@0.1.0"
    }
  }
});
