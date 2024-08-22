import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IlkOnayComponent } from './ilk-onay.component';

describe('IlkOnayComponent', () => {
  let component: IlkOnayComponent;
  let fixture: ComponentFixture<IlkOnayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IlkOnayComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(IlkOnayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
