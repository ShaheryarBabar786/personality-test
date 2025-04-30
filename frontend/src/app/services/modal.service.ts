// modal.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private modalState = new BehaviorSubject<{ isOpen: boolean; component: any; data: any }>({
    isOpen: false,
    component: null,
    data: null,
  });

  modalState$ = this.modalState.asObservable();

  open(component: any, data?: any) {
    this.modalState.next({ isOpen: true, component, data });
  }

  close() {
    this.modalState.next({ isOpen: false, component: null, data: null });
  }
}
