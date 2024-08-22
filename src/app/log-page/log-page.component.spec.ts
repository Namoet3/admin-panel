import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogPageComponent } from './log-page.component';

describe('TableComponent', () => {
  let component: LogPageComponent;
  let fixture: ComponentFixture<LogPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LogPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LogPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
