import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IkinciOnayComponent } from './ikinci-onay.component';

describe('IkinciOnayComponent', () => {
  let component: IkinciOnayComponent;
  let fixture: ComponentFixture<IkinciOnayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IkinciOnayComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(IkinciOnayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
