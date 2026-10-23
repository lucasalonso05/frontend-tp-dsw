import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';

// Desmonta lo que dibujó cada test para que no se mezcle con el siguiente.
afterEach(() => {
  cleanup();
});
