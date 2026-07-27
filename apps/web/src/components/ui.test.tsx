import { render, screen } from '@testing-library/react';
import { Checkbox, RadioGroup, Select, TextInput } from './ui';
import { expect, it } from 'vitest';
it('labels controls', () => {
  render(
    <>
      <TextInput label="Name" />
      <Select label="Course">
        <option>One</option>
      </Select>
      <Checkbox label="Updates" />
      <RadioGroup legend="Method" name="m" options={['Pickup']} />
    </>,
  );
  for (const n of ['Name', 'Course', 'Updates'])
    expect(screen.getByLabelText(n)).toBeInTheDocument();
  expect(screen.getByRole('group', { name: 'Method' })).toBeInTheDocument();
});
