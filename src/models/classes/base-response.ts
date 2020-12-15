import {GD_PER_PAGE_ITEMS_COUNT} from '@/utils/constants';

export class BaseResponse<Response> {
  public status: string = '';
  public code?: string;
  public message?: string;
  public body!: Response;
  public response!: Response;

  constructor(params: Partial<BaseResponse<Response>>) {
    if (params) {
      this.status = params.status || '';
      this.code = params.code || '';
      this.message = params.message || '';
    }
  }
}

export interface PagedResponse {
  count: number;
  page: number;
  totalPages: number;
  totalItems: number;
}

export class CommonPaginatedResponse<Response> {
  public count: number = GD_PER_PAGE_ITEMS_COUNT;
  public page: number = 1;
  public results: Response[] = [];
  public size?: number;
  public totalItems: number = 0;
  public totalPages: number = 0;
}
