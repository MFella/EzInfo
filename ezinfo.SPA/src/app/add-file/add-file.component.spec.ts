/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { AddFileComponent } from './add-file.component';

describe('AddFileComponent', () => {
  let component: AddFileComponent;
  let fixture: ComponentFixture<AddFileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddFileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
