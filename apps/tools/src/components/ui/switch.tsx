import { Switch as KobalteSwitch } from '@kobalte/core/switch';
import { type Component, splitProps } from 'solid-js';
import { cn } from '~/lib/utils';

interface SwitchProps {
  class?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  value?: string;
}

const Switch: Component<SwitchProps> = (props) => {
  const [local, others] = splitProps(props, [
    'class',
    'checked',
    'defaultChecked',
    'onChange',
    'disabled',
    'required',
    'name',
    'value',
  ]);

  return (
    <KobalteSwitch
      class={cn('peer inline-flex items-center', local.class)}
      checked={local.checked}
      defaultChecked={local.defaultChecked}
      onChange={local.onChange}
      disabled={local.disabled}
      required={local.required}
      name={local.name}
      value={local.value}
      {...others}
    >
      <KobalteSwitch.Input class="peer" />
      <KobalteSwitch.Control
        class={cn(
          // Base - iOS style switch
          'inline-flex h-[31px] w-[51px] shrink-0 cursor-pointer items-center rounded-full',
          'border-0 p-0.5',
          'transition-all duration-300 ease-out',
          // Unchecked state - subtle gray
          'data-[unchecked]:bg-secondary',
          // Checked state - Apple green (or use primary)
          'data-[checked]:bg-[hsl(142,71%,45%)]',
          // Focus state
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          // Disabled state
          'disabled:cursor-not-allowed disabled:opacity-50',
        )}
      >
        <KobalteSwitch.Thumb
          class={cn(
            // Base - circular thumb
            'pointer-events-none block h-[27px] w-[27px] rounded-full',
            'bg-white',
            // Apple-style shadow
            'shadow-[0_2px_4px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.06)]',
            // Transition
            'transition-transform duration-300 ease-out',
            // Position states
            'data-[checked]:translate-x-[20px] data-[unchecked]:translate-x-0',
          )}
        />
      </KobalteSwitch.Control>
    </KobalteSwitch>
  );
};

export { Switch };
