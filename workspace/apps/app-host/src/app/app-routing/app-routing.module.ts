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
