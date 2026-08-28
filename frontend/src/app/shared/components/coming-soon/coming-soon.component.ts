import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-coming-soon',
  standalone: true,
  template: `
    <section class="coming-soon">
      <h1>{{ title }}</h1>
      <p>This module hasn't been built yet.</p>
    </section>
  `,
  styles: [`
    .coming-soon {
      max-width: 640px;
      margin: 4rem auto;
      padding: 0 1.5rem;
      text-align: center;
      font-family: var(--font-sans);
    }
    h1 { font-size: 1.5rem; margin-bottom: 0.5rem; }
    p { color: var(--color-text-muted); }
  `],
})
export class ComingSoonComponent {
  @Input() title = 'Coming Soon';
}
