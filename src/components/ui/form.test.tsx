import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useFormField, FormField, FormItem, FormLabel, FormControl, FormMessage, Form } from './form';
import { useForm, FormProvider } from 'react-hook-form';
import React from 'react';

// A test component that uses useFormField outside of FormField context
const InvalidUseFormFieldComponent = () => {
  // This will use the context outside of FormField, which should throw
  // We need a FormProvider for useFormContext() to not throw first
  const TestInner = () => {
    try {
      const field = useFormField();
      return <div data-testid="field-name">{field.name}</div>;
    } catch (error) {
      return <div data-testid="error">{(error as Error).message}</div>;
    }
  };

  const methods = useForm();

  return (
    <FormProvider {...methods}>
      <TestInner />
    </FormProvider>
  );
};

// A component that uses useFormField inside FormField context (should work)
const ValidUseFormFieldComponent = () => {
  const methods = useForm({
    defaultValues: {
      email: '',
    },
  });

  return (
    <Form {...methods}>
      <form>
        <FormField
          control={methods.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <input {...field} data-testid="email-input" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};

describe('useFormField', () => {
  /**
   * Bug Test: useFormField should throw when used outside FormField context
   *
   * The original implementation checked `if (!fieldContext)` but since
   * React.useContext returns the default value (an empty object {}) when
   * used outside a provider, this check is always false (empty objects are truthy).
   *
   * This test exposes that bug by using useFormField outside FormField
   * and expecting an error to be thrown.
   */
  it('throws an error when used outside FormField context', () => {
    // Suppress console.error for expected React errors during test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<InvalidUseFormFieldComponent />);

    // The error should be caught and displayed
    expect(screen.getByTestId('error')).toHaveTextContent(
      'useFormField should be used within <FormField>'
    );

    consoleSpy.mockRestore();
  });

  it('works correctly when used inside FormField context', () => {
    render(<ValidUseFormFieldComponent />);

    // Should render the input without errors
    expect(screen.getByTestId('email-input')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
  });
});
