'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from './ui/breadcrumb';

export default function NavbarBreadCrumbs() {
  const pathname = usePathname();
  const pathArray = pathname.split('/').filter((val) => val !== '');
  let path = '';

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {pathArray.map((name, index) => {
          path += '/' + name;

          if (index === pathArray.length - 1) {
            return (
              <BreadcrumbItem
                className="hidden md:block capitalize text-base font-medium"
                key={index}
              >
                <Link href={path}>{name}</Link>
              </BreadcrumbItem>
            );
          }

          return (
            <div key={index} className="flex items-center gap-3">
              <BreadcrumbItem className="hidden md:block capitalize text-base font-medium">
                <Link href={path}>{name}</Link>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
            </div>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
