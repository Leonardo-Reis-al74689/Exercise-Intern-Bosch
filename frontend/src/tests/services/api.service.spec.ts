import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { ApiService } from '../../app/services/api.service';
import { MessagesService } from '../../app/core/services/messages.service';
import { StorageKeys } from '../../app/core/constants/storage-keys.constant';
import { environment } from '../../environments/environment';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;
  let messagesService: jasmine.SpyObj<MessagesService>;
  let localStorageSpy: jasmine.Spy;

  const mockData = { id: 1, name: 'Test' };

  beforeEach(() => {
    const messagesServiceSpy = jasmine.createSpyObj('MessagesService', ['getHttpErrorMessage'], {
      ERRORS: {
        UNKNOWN: 'Erro desconhecido',
        NETWORK: 'Erro de ligação. Verifique a sua ligação à internet.'
      }
    });
    messagesServiceSpy.getHttpErrorMessage.and.returnValue('Erro HTTP');

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ApiService,
        { provide: MessagesService, useValue: messagesServiceSpy }
      ]
    });

    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
    messagesService = TestBed.inject(MessagesService) as jasmine.SpyObj<MessagesService>;

    localStorage.clear();
    localStorageSpy = spyOn(localStorage, 'getItem').and.returnValue(null);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('deve ser criado', () => {
    expect(service).toBeTruthy();
  });

  describe('getHeaders (testado através das requisições)', () => {
    it('deve incluir Content-Type nos headers', () => {
      localStorageSpy.and.returnValue(null);

      service.get<any>('/test').subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/test`);
      expect(req.request.headers.get('Content-Type')).toBe('application/json');
    });

    it('deve incluir Authorization quando há token no localStorage', () => {
      const token = 'mock-token';
      localStorageSpy.and.callFake((key: string) => {
        return key === StorageKeys.ACCESS_TOKEN ? token : null;
      });

      service.get<any>('/test').subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/test`);
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${token}`);
    });

    it('não deve incluir Authorization quando não há token', () => {
      localStorageSpy.and.returnValue(null);

      service.get<any>('/test').subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/test`);
      expect(req.request.headers.has('Authorization')).toBeFalse();
    });
  });

  describe('get', () => {
    it('deve fazer uma requisição GET e retornar dados', () => {
      service.get<any>('/test').subscribe((data: any) => {
        expect(data).toEqual(mockData);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/test`);
      expect(req.request.method).toBe('GET');
      req.flush(mockData);
    });

    it('deve tratar erros HTTP', () => {
      const errorMessage = 'Erro de servidor';
      messagesService.getHttpErrorMessage.and.returnValue(errorMessage);

      service.get<any>('/test').subscribe({
        next: () => fail('deveria ter falhado'),
        error: (error: Error) => {
          expect(error.message).toBe(errorMessage);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/test`);
      req.flush({ message: errorMessage }, { status: 500, statusText: 'Server Error' });
    });

    it('deve tratar erros de rede', () => {
      service.get<any>('/test').subscribe({
        next: () => fail('deveria ter falhado'),
        error: (error: Error) => {
          expect(error.message).toContain('Erro de ligação');
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/test`);
      req.error(new ErrorEvent('Network error'));
    });
  });

  describe('post', () => {
    it('deve fazer uma requisição POST com dados e retornar resposta', () => {
      const postData = { name: 'New Item' };

      service.post<any>('/test', postData).subscribe((data: any) => {
        expect(data).toEqual(mockData);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/test`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(postData);
      req.flush(mockData);
    });

    it('deve tratar erros na requisição POST', () => {
      const errorMessage = 'Erro ao criar';
      messagesService.getHttpErrorMessage.and.returnValue(errorMessage);

      service.post<any>('/test', {}).subscribe({
        next: () => fail('deveria ter falhado'),
        error: (error: Error) => {
          expect(error.message).toBe(errorMessage);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/test`);
      req.flush({ message: errorMessage }, { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('put', () => {
    it('deve fazer uma requisição PUT com dados e retornar resposta', () => {
      const updateData = { name: 'Updated Item' };

      service.put<any>('/test/1', updateData).subscribe((data: any) => {
        expect(data).toEqual(mockData);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/test/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateData);
      req.flush(mockData);
    });

    it('deve tratar erros na requisição PUT', () => {
      const errorMessage = 'Erro ao atualizar';
      messagesService.getHttpErrorMessage.and.returnValue(errorMessage);

      service.put<any>('/test/1', {}).subscribe({
        next: () => fail('deveria ter falhado'),
        error: (error: Error) => {
          expect(error.message).toBe(errorMessage);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/test/1`);
      req.flush({ message: errorMessage }, { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('delete', () => {
    it('deve fazer uma requisição DELETE e retornar resposta', () => {
      service.delete<any>('/test/1').subscribe((data: any) => {
        expect(data).toEqual(mockData);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/test/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(mockData);
    });

    it('deve tratar erros na requisição DELETE', () => {
      const errorMessage = 'Erro ao eliminar';
      messagesService.getHttpErrorMessage.and.returnValue(errorMessage);

      service.delete<any>('/test/1').subscribe({
        next: () => fail('deveria ter falhado'),
        error: (error: Error) => {
          expect(error.message).toBe(errorMessage);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/test/1`);
      req.flush({ message: errorMessage }, { status: 404, statusText: 'Not Found' });
    });
  });

  describe('handleError', () => {
    it('deve usar mensagem do erro quando disponível', () => {
      const errorMessage = 'Mensagem específica do erro';

      service.get<any>('/test').subscribe({
        next: () => fail('deveria ter falhado'),
        error: (error: Error) => {
          expect(error.message).toBe(errorMessage);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/test`);
      req.flush({ message: errorMessage }, { status: 400, statusText: 'Bad Request' });
    });

    it('deve usar getHttpErrorMessage quando não há mensagem específica', () => {
      const httpErrorMessage = 'Erro HTTP genérico';
      messagesService.getHttpErrorMessage.and.returnValue(httpErrorMessage);

      service.get<any>('/test').subscribe({
        next: () => fail('deveria ter falhado'),
        error: (error: Error) => {
          expect(error.message).toBe(httpErrorMessage);
          expect(messagesService.getHttpErrorMessage).toHaveBeenCalled();
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/test`);
      req.flush({}, { status: 500, statusText: 'Server Error' });
    });
  });
});

