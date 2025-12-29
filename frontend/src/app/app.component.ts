import { Component, OnInit } from '@angular/core';
import { ThemeService } from './core/services/theme.service';
import { ThemeMode } from './core/enums/theme-mode.enum';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: false
})
export class AppComponent implements OnInit {
  title = 'Gestor de Tarefas';
  currentTheme: ThemeMode = ThemeMode.LIGHT;

  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    this.themeService.currentTheme$.subscribe(theme => {
      this.currentTheme = theme;
    });
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}

