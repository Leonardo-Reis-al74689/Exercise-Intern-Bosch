import { Subject, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

/**
 * Utilitário para criar um debounce em observables
 */
export class DebounceUtil {
  /**
   * Cria um observable com debounce
   * @param delay Tempo de espera em milissegundos
   */
  static createDebounced<T>(delay: number = 300): Subject<T> {
    const subject = new Subject<T>();
    return subject.pipe(
      debounceTime(delay),
      distinctUntilChanged()
    ) as Subject<T>;
  }

  /**
   * Aplica debounce a um observable existente
   */
  static applyDebounce<T>(source: Observable<T>, delay: number = 300): Observable<T> {
    return source.pipe(
      debounceTime(delay),
      distinctUntilChanged()
    );
  }
}

