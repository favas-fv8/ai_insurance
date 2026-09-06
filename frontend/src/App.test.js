import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the Ai-IPP application shell', () => {
  render(<App />);
  const brandElement = screen.getAllByText(/Ai-IPP/i);
  expect(brandElement.length).toBeGreaterThan(0);
});