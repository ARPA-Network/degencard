'use client';

import clsx from 'clsx';
import {useParams} from 'next/navigation';
import {ChangeEvent, ReactNode, useTransition} from 'react';
import {Locale} from '@/config';
import {setUserLocale} from '@/locale';


type Props = {
  children: ReactNode;
  defaultValue: string;
  label: string;
};

export default function LocaleSwitcherSelect({
  children,
  defaultValue,
  label
}: Props) {
  const [isPending, startTransition] = useTransition();

  function onSelectChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextLocale = event.target.value;
    startTransition(() => {
      // @ts-expect-error 
      setUserLocale(nextLocale);
    });
  }

  return (
    <label
      className={clsx(
        'relative text-white',
        isPending && 'transition-opacity [&:disabled]:opacity-30'
      )}
    >
      <p className="sr-only">{label}</p>
      <select
        className="cursor-pointer inline-flex appearance-none bg-violet-500 rounded-md md:rounded-full py-[0.35rem] md:py-2 px-2 md:pl-5 md:pr-6 focus-visible:outline-none text-xs md:text-base"
        defaultValue={defaultValue}
        disabled={isPending}
        onChange={onSelectChange}
      >
        {children}
      </select>
    </label>
  );
}