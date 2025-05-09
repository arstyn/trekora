import { Link } from 'links/entities/link.entity';

import { CreateLinkDto } from 'links/dto/create-link.dto';
import { UpdateLinkDto } from 'links/dto/update-link.dto';
import { ILoginDto, ILoginResponse } from 'auth/dto/auth.types';

export const links = {
  dto: {
    CreateLinkDto,
    UpdateLinkDto,
    ILoginDto,
    ILoginResponse,
  },
  entities: {
    Link,
  },
};
