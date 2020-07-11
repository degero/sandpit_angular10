import { MessageService } from './message.service';
import { Hero } from './hero';
import { Injectable } from '@angular/core';
import { HEROES } from './mock-heroes';
import { Observable, of, ObservableLike } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class HeroService {
  private heroesUrl = 'api/heroes';
  private httpOptions = {
    headers: new HttpHeaders({ 'conntent-type': 'application/json' }),
  };

  constructor(
    private httpClient: HttpClient,
    private messageService: MessageService
  ) {}

  getHeroes(): Observable<Hero[]> {
    this.log('HeroService: fetched heroes');
    return this.httpClient
      .get<Hero[]>(this.heroesUrl)
      .pipe(
        tap(
          (_) => this.log('fetched heroes'),
          catchError(this.handleError<Hero[]>('getHeroes', []))
        )
      );
  }

  getHero(id: number): Observable<Hero> {
    const url = `${this.heroesUrl}/${id}`;
    return this.httpClient
      .get<Hero>(url)
      .pipe(
        tap(
          (_) => this.log('fetched hero id=${id}'),
          catchError(this.handleError<Hero>(`getHero id=${id}`))
        )
      );
  }

  updateHero(hero: Hero): Observable<any> {
    return this.httpClient
      .put(this.heroesUrl, hero, this.httpOptions)
      .pipe(
        tap(
          (_) => this.log(`update hero id=${hero.id}`),
          catchError(this.handleError<any>('updateHero'))
        )
      );
  }

  addHero(hero: Hero): Observable<Hero> {
    return this.httpClient
      .post<Hero>(this.heroesUrl, hero, this.httpOptions)
      .pipe(
        tap(
          (newHero: Hero) => this.log(`added hero with id=${hero.id}`),
          catchError(this.handleError<Hero>('addHero'))
        )
      );
  }
  deleteHero(hero: Hero): Observable<any> {
    return this.httpClient
      .delete<Hero>(this.heroesUrl)
      .pipe(
        tap(
          (_) => this.log(`deleted hero id=${hero.id}`),
          catchError(this.handleError<Hero>('deleteHero'))
        )
      );
  }

  searchHeroes(term: string): Observable<Hero[]> {
    if (!term.trim()) {
      return of([]);
    }
    return this.httpClient
      .get<Hero[]>(`${this.heroesUrl}/?name=${term}`)
      .pipe(
        tap(
          (x) =>
            x.length
              ? this.log(`found heroes matching term "${term}"`)
              : this.log(`No heroes found matching term "${term}"`),
          catchError(this.handleError<Hero[]>(`searchHeroes`, []))
        )
      );
  }

  /** GET hero by id. Return `undefined` when id not found */
  getHeroNo404<Data>(id: number): Observable<Hero> {
    const url = `${this.heroesUrl}/?id=${id}`;
    return this.httpClient.get<Hero[]>(url).pipe(
      map((heroes) => heroes[0]), // returns a {0|1} element array
      tap((h) => {
        const outcome = h ? `fetched` : `did not find`;
        this.log(`${outcome} hero id=${id}`);
      }),
      catchError(this.handleError<Hero>(`getHero id=${id}`))
    );
  }

  private log(msg: string) {
    this.messageService.add(msg);
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error);
      this.log(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }
}
