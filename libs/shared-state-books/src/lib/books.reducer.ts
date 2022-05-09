import { createReducer, on, Action, createSelector } from '@ngrx/store';
import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { BookModel, calculateBooksGrossEarnings } from '@book-co/shared-models';
import { BooksPageActions, BooksApiActions } from '@book-co/books-page/actions';

const createBook = (books: BookModel[], book: BookModel) => [...books, book];
const updateBook = (books: BookModel[], changes: BookModel) =>
  books.map((book) => {
    return book.id === changes.id ? Object.assign({}, book, changes) : book;
  });
const deleteBook = (books: BookModel[], bookId: string) =>
  books.filter((book) => bookId !== book.id);


export interface State {
  collection: BookModel[];
  activeBookId: string | null;
}

export const initialState: State = {
  collection: [],
  activeBookId: null
}

export const reducer = createReducer(
  initialState,
  on(
    BooksPageActions.clearSelectedBook, 
    BooksPageActions.enter, 
    (state) => {
      return {
        ...state,
        activeBookId: null
      }
  }),
  on(BooksPageActions.selectBook, (state, actions) => {
    return {
      ...state,
      activeBookId: actions.bookId
    }
  }),
  on(BooksApiActions.bookCreated, (state,action) => {
    return {
      collection: createBook(state.collection, action.book),
      activeBookId: null
    }
  }),
  on(BooksApiActions.bookUpdated, (state, action) => {
    return {
      collection: updateBook(state.collection, action.book),
      activeBookId: null
    }
  }),
  on(BooksApiActions.bookDeleted, (state, action) => {
    return {
      ...state, 
      collection: deleteBook(state.collection, action.bookId)
    }
  })
);

/** Exporting Selectors */
export const selectAll = (state: State) => state.collection; // Straight Forward Selector
export const selectActiveBookId = (state: State) => state.activeBookId;

/* export const selectActiveBook_bad_performance = (state: State) => {
  const books = selectAll(state);
  const activeBookId = selectActiveBookId(state);

  return books.find((book) => book.id === activeBookId) || null;
}; */

export const selectActiveBook = createSelector( // Uses Memoization // Selector that needs complex calculation.
  selectAll,
  selectActiveBookId,
  (books, activeBookId) => {
    return books.find((book) => book.id === activeBookId) || null;
  }
);


/* export const selectEarningTotals = createSelector(selectAll, (books) => {
  return calculateBooksGrossEarnings(books);
}) */

// Short Syntax of above
export const selectEarningTotals = createSelector(selectAll,calculateBooksGrossEarnings);