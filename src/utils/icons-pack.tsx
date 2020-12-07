import React from 'react';
import {Image, ImageRequireSource} from 'react-native';
import Send_white from '../assets/images/icons/send_white.svg';
import Compose from '../assets/images/icons/compose.svg';
import Send from '../assets/images/icons/send.svg';
import Sort from '../assets/images/icons/sort.svg';
import Calendar from '../assets/images/icons/calendar.svg';
import Download from '../assets/images/icons/download.svg';
import More from '../assets/images/icons/more.svg';
import Incoming from '../assets/images/icons/incoming.svg';
import Outgoing from '../assets/images/icons/outgoing.svg';
import Search from '../assets/images/icons/search.svg';
import Plus from '../assets/images/icons/plus.svg';
import ArrowRight from '../assets/images/icons/arrowRight.svg';

const IconProvider = (source: ImageRequireSource) => ({
  toReactElement: ({...style}) => <Image style={style} source={source} />,
});

export const GdIconsPack = {
  name: 'Gd',
  icons: {
    logo: IconProvider(require('../assets/images/logo2x.png')),
    company: IconProvider(require('../assets/images/icons/company.png')),
    voucher: IconProvider(require('../assets/images/icons/voucher.png')),
    gmail: IconProvider(require('../assets/images/icons/google.png')),
    apple: IconProvider(require('../assets/images/icons/apple.png')),
    email: IconProvider(require('../assets/images/icons/email.png')),
    lock: IconProvider(require('../assets/images/icons/Lock.png')),
    send: IconProvider(require('../assets/images/icons/send.svg')),
    sort: IconProvider(require('../assets/images/icons/sort.png')),
    download: IconProvider(require('../assets/images/icons/download.svg')),
    calendar: IconProvider(require('../assets/images/icons/calendar.svg')),
    more: IconProvider(require('../assets/images/icons/more.png')),
    plus: IconProvider(require('../assets/images/icons/plus.png')),
  },
};

export const GdSVGIcons = {
  send: Send,
  send_white: Send_white,
  compose: Compose,
  download: Download,
  sort: Sort,
  calendar: Calendar,
  more: More,
  incoming: Incoming,
  outgoing: Outgoing,
  search: Search,
  plus: Plus,
  arrowRight: ArrowRight
};

export const GdImages = {
  name: 'Gd',
  icons: {
    logo: require('../assets/images/logo2x.png'),
    logoSmall: require('../assets/images/logo.png'),
    logoGiddh: require('../assets/images/giddh.png'),
  },
};
