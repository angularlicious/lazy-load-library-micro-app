import { async, TestBed } from '@angular/core/testing';
import { SecurityAppModule } from './security-app.module';

describe('SecurityAppModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SecurityAppModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(SecurityAppModule).toBeDefined();
  });
});
