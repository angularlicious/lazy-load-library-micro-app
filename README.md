# Lazy Load Angular Library (Micro-Applications)

A simple Angular Workspace that demonstrates the capability of lazy-loading a library as a feature module (a.k.a. micro-app). 

Angular 6 gave us the Angular Workspace and the new *library* project type. The library project type allows us to create things that can be shared - reusable code. No more copy and paste programming, right? There are many use cases fo Angular libraries. Most of the common ones include the following:

* utility
* framework
* component
* foundational
* cross-cutting concern

These are single libraries that are used by multiple application and/or other library  projects. However, there is another one that I'm not sure how to categorize. We have these larger features in our existing applications that will be shared by at least 2 different application projects.

Therefore, it makes sense to implement them as library projects. Greatm now I would like to lazy-load this library as I would a feature module in my application. Is this even possible. I also want to take advantage of [Nrwl's Nx Workspace](https://nx.dev) and the new `import` syntax for lazy-loading modules in Angular 8.

* Nx Workspace
* Angular 8 *import* modules.

## Create a new Workspace

Let's get started by creating a new Nx workspace to work in. 

```ts
yarn create nx-workspace lazyLoadLibraryApp --npm-scope=lazy
```

Installing `@nrwl/cli` globally: `yarn add @nrwl/cli`

```ts
yarn global add @nrwl/cli
```

## Enable Angular (CLI) Templates

1. Install the `@nrwl/angular` package. 

    ```ts
    yarn add @nrwl/angular
    ```

2. Update the `cli` setting in the angular.json file.

    ```json
    "cli": {
        "defaultCollection": "@nrwl/angular"
    }
    ```


## Add Host Application

Now that the `application` template is available by the `@nrwl/angular` package create a new *application* project. The host application project will be the host for the library micro-app.

```ts
ng g application appHost
? Which stylesheet format would you like to use? SASS(.scss)  [ http://sass-lang.com   ]
? Would you like to configure routing for this application? Yes
```

## Add Library Project for Micro-App

This library project will be implemented as a micro-application - it will require a host *application* project to lazy-load the module. Typically, you wouldn't think of a library project as an application - however, in this case it can be a self-contained application that has:

* services
* components
* pipes
* directives
* classes

```ts
ng g library securityApp --publishable
? Which stylesheet format would you like to use? SASS(.scss)  [ http://sass-lang.com   ]
```

This application library doesn't even have to *export* any of its items. By default the `index.ts` barrel file exports all that is need to lazy-load the micro-application:

*libs\security-app\src\index.ts*
```ts
export * from './lib/security-app.module';
```

## Routing Module

Create a routing module in the *app-host* project to configure the routes for lazy-loading.

```ts
ng g module appRouting --project=app-host
CREATE apps/app-host/src/app/app-routing/app-routing.module.ts (196 bytes)
```

Create a `const` for the *routes*. This is where the magic happens. We will lazy-load the library micro-app here. 

```ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    // lazy-load the library application here; 
  }
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forRoot(routes)
  ]
})
export class AppRoutingModule { }
```

### Security-App Library Project

Before we can lazy-load the micro-app, we will need to implement some displayable elements in the micro-app. Create a routing module for the security library.

```ts
ng g module appRouting --project=security-app
CREATE libs/security-app/src/lib/app-routing/app-routing.module.ts (196 bytes)
```


```ts
import { NgModule, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from '../login/login.component';

const routes: Routes = [
  {
    path: '', // default route for the security application.
    component: LoginComponent
  }
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class AppRoutingModule { }
```

Add a new component to the library. This is just to have at least an entry point for the new micro-app. The entry component could be a dashboard or any other type of *container* component. We only need a single/simple component to demonstrate lazy-loading a micro-app into the host application project.

```ts
ng g component login --project=security-app
```

Make sure that the `SecurityAppModule` declares the new component.

```ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppRoutingModule } from './app-routing/app-routing.module';
import { LoginComponent } from './login/login.component';

@NgModule({
  declarations: [
    LoginComponent
  ],
  imports: [
    AppRoutingModule,
    CommonModule]
})
export class SecurityAppModule {}

```

## Lazy-Load the Library (micro-app)

We will now implement our lazy-loaded route in the application host project. Use the new *import* syntax. 

> We import the module that is located in the `@lazy/security-app` library project (as if it were a package courtesy of Nx `--npm-scope` *@lazy*). 

```ts
{
    // lazy-load the library application here; 
    path: '',
    loadChildren: () => import(`@lazy/security-app`).then(m => m.SecurityAppModule),
}
  ```

Notice that we do not need to nor should we import the `SecurityAppModule` - the import process is enabled using the loadChildren `import` method.

```ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

// DO NOT IMPORT - IMPORTED VIA THE LAZY-LOAD PROCESS BELOW!!!!
// import { SecurityAppModule } from '@lazy/security-app'

const routes: Routes = [
  {
    // lazy-load the library application here; 
    path: '',
    loadChildren: () => import(`@lazy/security-app`).then(m => m.SecurityAppModule),
  }
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forRoot(routes)
  ]
})
export class AppRoutingModule { }
```

> Note: The import reference to `@lazy/security-app` is enabled through the configuration in the workspace `tsconf.json` file in the `paths` node.

```json
"paths": {
      "@lazy/security-app": ["libs/security-app/src/index.ts"]
    }
```

## Serve It up

We are now ready to lazy-lad the library project as a micro-app. I have been calling this a *feature* library recently. However, I do see some use cases where these could be smaller well-contained applications that are used to compose a greater application. It allows you to encapsulate the implementation in a single project type.

Also, most applications require some configuration - even small ones. Therefore, it will be the responsibility of the host application to provide the library any required configuration. 

```ts
ng serve app-host
```

![](./lazy-load-library-micro-app.png)

```js
(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["lazy-security-app"],{

/***/ "../../libs/security-app/src/index.ts":
/*!**********************************************************************************!*\
  !*** D:/matt-vaughn/gitlab/lazy-load-library-app/libs/security-app/src/index.ts ***!
  \**********************************************************************************/
/*! exports provided: SecurityAppModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "../../node_modules/tslib/tslib.es6.js");
/* harmony import */ var _lib_security_app_module__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./lib/security-app.module */ "../../libs/security-app/src/lib/security-app.module.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "SecurityAppModule", function() { return _lib_security_app_module__WEBPACK_IMPORTED_MODULE_1__["SecurityAppModule"]; });





/***/ }),

/***/ "../../libs/security-app/src/lib/app-routing/app-routing.module.ts":
/*!***************************************************************************************************************!*\
  !*** D:/matt-vaughn/gitlab/lazy-load-library-app/libs/security-app/src/lib/app-routing/app-routing.module.ts ***!
  \***************************************************************************************************************/
/*! exports provided: AppRoutingModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AppRoutingModule", function() { return AppRoutingModule; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "../../node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "../../node_modules/@angular/core/fesm2015/core.js");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/common */ "../../node_modules/@angular/common/fesm2015/common.js");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/router */ "../../node_modules/@angular/router/fesm2015/router.js");
/* harmony import */ var _login_login_component__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../login/login.component */ "../../libs/security-app/src/lib/login/login.component.ts");





const routes = [
    {
        path: '',
        component: _login_login_component__WEBPACK_IMPORTED_MODULE_4__["LoginComponent"]
    }
];
let AppRoutingModule = class AppRoutingModule {
};
AppRoutingModule = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
    Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["NgModule"])({
        declarations: [],
        imports: [
            _angular_common__WEBPACK_IMPORTED_MODULE_2__["CommonModule"],
            _angular_router__WEBPACK_IMPORTED_MODULE_3__["RouterModule"].forChild(routes)
        ]
    })
], AppRoutingModule);



/***/ }),

/***/ "../../libs/security-app/src/lib/login/login.component.scss":
/*!********************************************************************************************************!*\
  !*** D:/matt-vaughn/gitlab/lazy-load-library-app/libs/security-app/src/lib/login/login.component.scss ***!
  \********************************************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = ("\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJsaWJzL3NlY3VyaXR5LWFwcC9zcmMvbGliL2xvZ2luL2xvZ2luLmNvbXBvbmVudC5zY3NzIn0= */");

/***/ }),

/***/ "../../libs/security-app/src/lib/login/login.component.ts":
/*!******************************************************************************************************!*\
  !*** D:/matt-vaughn/gitlab/lazy-load-library-app/libs/security-app/src/lib/login/login.component.ts ***!
  \******************************************************************************************************/
/*! exports provided: LoginComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "LoginComponent", function() { return LoginComponent; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "../../node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "../../node_modules/@angular/core/fesm2015/core.js");


let LoginComponent = class LoginComponent {
    constructor() { }
    ngOnInit() {
    }
};
LoginComponent = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
    Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Component"])({
        selector: 'lazy-login',
        template: tslib__WEBPACK_IMPORTED_MODULE_0__["__importDefault"](__webpack_require__(/*! raw-loader!./login.component.html */ "../../node_modules/raw-loader/dist/cjs.js!../../libs/security-app/src/lib/login/login.component.html")).default,
        styles: [tslib__WEBPACK_IMPORTED_MODULE_0__["__importDefault"](__webpack_require__(/*! ./login.component.scss */ "../../libs/security-app/src/lib/login/login.component.scss")).default]
    }),
    tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:paramtypes", [])
], LoginComponent);



/***/ }),

/***/ "../../libs/security-app/src/lib/security-app.module.ts":
/*!****************************************************************************************************!*\
  !*** D:/matt-vaughn/gitlab/lazy-load-library-app/libs/security-app/src/lib/security-app.module.ts ***!
  \****************************************************************************************************/
/*! exports provided: SecurityAppModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SecurityAppModule", function() { return SecurityAppModule; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "../../node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "../../node_modules/@angular/core/fesm2015/core.js");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/common */ "../../node_modules/@angular/common/fesm2015/common.js");
/* harmony import */ var _app_routing_app_routing_module__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app-routing/app-routing.module */ "../../libs/security-app/src/lib/app-routing/app-routing.module.ts");
/* harmony import */ var _login_login_component__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./login/login.component */ "../../libs/security-app/src/lib/login/login.component.ts");





let SecurityAppModule = class SecurityAppModule {
};
SecurityAppModule = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
    Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["NgModule"])({
        declarations: [
            _login_login_component__WEBPACK_IMPORTED_MODULE_4__["LoginComponent"]
        ],
        imports: [
            _app_routing_app_routing_module__WEBPACK_IMPORTED_MODULE_3__["AppRoutingModule"],
            _angular_common__WEBPACK_IMPORTED_MODULE_2__["CommonModule"]
        ]
    })
], SecurityAppModule);



/***/ }),

/***/ "../../node_modules/raw-loader/dist/cjs.js!../../libs/security-app/src/lib/login/login.component.html":
/*!****************************************************************************************************************************************************************************************!*\
  !*** D:/matt-vaughn/gitlab/lazy-load-library-app/node_modules/raw-loader/dist/cjs.js!D:/matt-vaughn/gitlab/lazy-load-library-app/libs/security-app/src/lib/login/login.component.html ***!
  \****************************************************************************************************************************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = ("<p>login works!</p>\n");

/***/ })

}]);
//# sourceMappingURL=lazy-security-app.js.map
```
