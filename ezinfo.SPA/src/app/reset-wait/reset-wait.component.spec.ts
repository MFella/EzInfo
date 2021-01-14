/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ResetWaitComponent } from './reset-wait.component';

describe('ResetWaitComponent', () => {
  let component: ResetWaitComponent;
  let fixture: ComponentFixture<ResetWaitComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResetWaitComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResetWaitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
