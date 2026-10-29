import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HeaderComponent } from './header.component';
import { AuthService } from '../../../core/services/auth.service';

describe('HeaderComponent', () => {
  let fixture: ComponentFixture<HeaderComponent>;
  let component: HeaderComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: {
          isTpo: () => false,
          isLoggedIn: () => false,
          needsProfile: () => false,
          currentUser: () => null,
          logout: () => undefined,
        } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('starts with the mobile menu closed', () => {
    expect(component.menuOpen).toBeFalse();
    expect(fixture.nativeElement.querySelector('nav.nav-open')).toBeNull();
  });

  it('opens and closes the mobile menu', () => {
    component.toggleMenu();
    fixture.detectChanges();
    expect(component.menuOpen).toBeTrue();
    expect(fixture.nativeElement.querySelector('nav.nav-open')).not.toBeNull();

    component.closeMenu();
    fixture.detectChanges();
    expect(component.menuOpen).toBeFalse();
    expect(fixture.nativeElement.querySelector('nav.nav-open')).toBeNull();
  });

  it('renders the main placement modules', () => {
    const nav = fixture.nativeElement.querySelector('nav') as HTMLElement;
    expect(nav.textContent).toContain('Jobs');
    expect(nav.textContent).toContain('Applications');
    expect(nav.textContent).toContain('Notices');
  });
});
