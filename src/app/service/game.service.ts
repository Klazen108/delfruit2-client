import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Game } from '../model/game';
import { Review } from '../model/review';
import { List } from '../model/list';
import { Tag } from '../model/tag';
import { PublicUser } from '../model/public-user';
import { Screenshot } from '../model/screenshot';
import { Observable ,  of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { GameSearchParams } from '../game-search-params';
import { User } from '../model/user';
import { Moment } from 'moment';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

export class GameListResponse {
  games: Game[];
  total?: number;
}

@Injectable()
export class GameService {
  private gamesUrl = '/api/games';

  constructor(
    private http: HttpClient
  ) { }

  getGames(params: GameSearchParams): Observable<GameListResponse> {
    let p = new HttpParams();
    p = p.append("page", (""+params.page)||"0");
    p = p.append("limit", (""+params.limit)||"25");
    if (params.orderCol) p = p.append("order_col", params.orderCol);
    if (params.orderDir) p = p.append("order_dir", params.orderDir);

    if (params.q) p = p.append("q", params.q);
    if (params.id) p = p.append("id", ""+params.id);
    if (params.name) p = p.append("name", params.name);
    
    if (params.tags) p = p.append("tags", JSON.stringify(params.tags));
    if (params.author) p = p.append("author", params.author);
    if (params.hasDownload) p = p.append("hasDownload", params.hasDownload?"1":"0");
    if (params.createdFrom) p = p.append("createdFrom", params.createdFrom);
    if (params.createdTo) p = p.append("createdTo", params.createdTo);
    if (params.clearedByUserId) p = p.append("clearedByUserId", ""+params.clearedByUserId);
    if (params.reviewedByUserId) p = p.append("reviewedByUserId", ""+params.reviewedByUserId);
    if (params.ratingFrom) p = p.append("ratingFrom", ""+params.ratingFrom);
    if (params.ratingTo) p = p.append("ratingTo", ""+params.ratingTo);
    if (params.difficultyFrom) p = p.append("difficultyFrom", ""+params.difficultyFrom);
    if (params.difficultyTo) p = p.append("difficultyTo", ""+params.difficultyTo);
    if (params.ownerUserId) p = p.append("ownerUserId", ""+params.ownerUserId);

    return this.http.get<Game[]>(
      this.gamesUrl, 
      {params: p, observe: 'response'}
    ).pipe(map(response => ({
        games:response.body,
        total:+response.headers.get('total-count')
      })
    ));
  }

  getGame(id: string): Observable<Game> {
    return this.http.get<Game>(`${this.gamesUrl}/${id}`);
  }

  updateGame(game: Game): Observable<any> {
    return this.http.patch<Game>(`${this.gamesUrl}/${game.id}`,game);
  }

  addScreenshot(gameId: number, description: string, file: File): Observable<any> {
    const formData: FormData = new FormData();
    formData.append("description",description);
    formData.append("screenshot",file);
    return this.http.post<Screenshot>(
      `${this.gamesUrl}/${gameId}/screenshots`,
      formData);
  }

  getReviews(page: number, limit: number): Observable<Review[]> {
    let p = new HttpParams();
    p = p.append("page", page.toString());
    p = p.append("limit", limit.toString());
    return this.http.get<Review[]>(`/api/reviews`,{params: p});
  }

  getReview(id: number): Observable<Review> {
    return this.http.get<Review>(`/api/reviews/${id}`);
  }

  getReviewsForGame(gameId: number): Observable<Review[]> {
    let params = new HttpParams();
    params = params.append("textReviewsFirst", "true");
    return this.http.get<Review[]>(`/api/games/${gameId}/reviews`,{params});
  }

  getReviewsForUserGame(gameId: number, userId: number): Observable<Review[]> {
    let params = new HttpParams();
    params = params.append("byUserId", ""+userId);
    params = params.append("includeOwnerReview", "true");
    return this.http.get<Review[]>(`/api/games/${gameId}/reviews`,{params});
  }

  getScreenshotsForGame(gameId: number): Observable<Screenshot[]> {
    let params = new HttpParams();
    params = params.append("approved", "1"); //forced for non admins on server
    return this.http.get<Screenshot[]>(`/api/games/${gameId}/screenshots`,
      {params});
  }

  getUser(userId: number): Observable<PublicUser> {
    return this.http.get<PublicUser>(`/api/users/${userId}`);
  }

  getReviewsForUser(userId: number): Observable<Review[]> {
    return this.http.get<Review[]>(`/api/users/${userId}/reviews`);
  }

  getListsForUserGame(userId: number, gameId: number): Observable<List[]> {
    return this.http.get<List[]>(`/api/users/${userId}/games/${gameId}/lists`);
  }

  updateList(userId: number, gameId: number, 
      listId: number, value: boolean): Observable<List[]> {
    const url = `/api/lists/${listId}`;
    return this.http.post<List[]>(url,{
      userId: userId,
      gameId: gameId,
      value: value
    });
  }

  getTagsForGame(gameId: number, userId?: number): Observable<Tag[]> {
    let params = new HttpParams();
    if (userId) params = params.append("uid", ""+userId);
    return this.http.get<Tag[]>(`/api/games/${gameId}/tags`,{params});
  }

  submitReview(gameId: number, review: Review): Observable<any> {
    return this.http.put<Review>(`/api/games/${gameId}/reviews`,review);
  }

  likeReview(reviewId, userId: number): Observable<any> {
    return this.http.put(`/api/reviews/${reviewId}/likes/${userId}`,{})
  }

  unlikeReview(reviewId, userId: number): Observable<any> {
    return this.http.delete(`/api/reviews/${reviewId}/likes/${userId}`)
  }

  isLiked(reviewId, userId: number): Observable<any> {
    return this.http.get(`/api/reviews/${reviewId}/likes/${userId}`)
  }

  getNews(): Observable<any> {
    return this.http.get(`/api/news`)
  }

  getTagSuggestions(q: string): Observable<any> {
    let params = new HttpParams();
    params = params.append("q", q);
    return this.http.get<Tag[]>(`/api/tags/`,{params});
  }

  getTag(tagId: number): Observable<Tag> {
    return this.http.get<Tag>(`/api/tags/${tagId}`)
  }

  getTagByName(tagName: string): Observable<Tag> {
    let params = new HttpParams();
    params = params.append("name", tagName);
    return this.http.get<Tag[]>(`/api/tags`,{params})
      .pipe(map(tags => tags.length==1?tags[0]:null));
  }

  setTags(gameId, tagIds: number[]): Observable<any> {
    return this.http.post(`/api/games/${gameId}/tags`,tagIds)
  }

  addTag(tag: Tag): Observable<Tag> {
    return this.http.post<Tag>(`/api/tags`,tag)
  }

  addNews(news: any): Observable<any> {
    return this.http.post<any>(`/api/news`,news)
  }

  addGame(game: Game): Observable<Game> {
    return this.http.post<Game>(`/api/games`,game)
  }

  getUsers(name?: string): Observable<User[]> {
    let params = new HttpParams()
    if (name) params = params.append('name', name);
    return this.http.get<User[]>(`/api/users`,
    {params})
  }

  updatePermission(uid: number, name: string, until: Moment) {
    return this.http.patch<any>(`/api/users/${uid}/permissions/${name}`,{
      revoked_until: until.toISOString()
    })
  }
}