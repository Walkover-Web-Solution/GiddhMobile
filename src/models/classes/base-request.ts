export abstract class BasePaginationRequest {
  public q: string = '';
  public page: number = 0;
  public count: number = 15;
  public from: string = '';
  public to: string = '';
  public sort: string = 'asc';
  public reversePage: boolean = false;
}
