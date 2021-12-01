import React from "react";
import { Button } from './Button';
import { action } from '@storybook/addon-actions';
import docMd from './Button.docs.md';

const story = {
  title: "Button",
  parameters: {
    notes: { docMd },
  },
  argTypes: {
    type: {
      options: ['primary', 'secondary'],
      control: { type: 'select' },
    },
  },
};

export default story;

const Template = ({ type, label }) => <Button onClick={action('clicked')} type={type}>{label}</Button>;

export const Default = Template.bind({});

Default.args = {
   type: 'primary',
   label: 'Primary Button',
};