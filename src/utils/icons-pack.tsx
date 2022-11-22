import React from 'react';
import { Image, ImageRequireSource } from 'react-native';
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
import Premium from '../assets/images/icons/premium.svg';
import Back from '../assets/images/icons/Backward.svg';
import Currency from '../assets/images/icons/currency.svg';
import GSTR from '../assets/images/icons/gstr.svg';
import Inventory from '../assets/images/icons/inventory.svg';
import Purchase from '../assets/images/icons/purchase.svg';
import Report from '../assets/images/icons/report.svg';
import Settings from '../assets/images/icons/settings.svg';
import Company from '../assets/images/icons/company.svg';
import Discount from '../assets/images/icons/discount.svg';
import Notifications from '../assets/images/icons/notifications.svg';
import Profile from '../assets/images/icons/Profile.svg';
import Trigger from '../assets/images/icons/trigger.svg';
import Lock from '../assets/images/icons/Lock.svg';
import Help from '../assets/images/icons/help.svg';
import Phone from '../assets/images/icons/phone.svg';
import Location from '../assets/images/icons/address.svg';
import Product from '../assets/images/icons/Product.svg';
import Gstin from '../assets/images/icons/gstin.svg';

const IconProvider = (source: ImageRequireSource) => ({
  toReactElement: ({ ...style }) => <Image style={style} source={source} />
});

export const GdIconsPack = {
  name: 'Gd',
  icons: {
    logo: IconProvider(require('../assets/images/logo2x.png')),
    company: IconProvider(require('../assets/images/icons/company.png')),
    voucher: IconProvider(require('../assets/images/icons/voucher.png')),
    gmail: IconProvider(require('../assets/images/icons/google.png')),
    apple: IconProvider(require('../assets/images/icons/apple.png')),
    msg91: IconProvider(require('../assets/images/icons/msg91-white-icon.png')),
    email: IconProvider(require('../assets/images/icons/email.png')),
    lock: IconProvider(require('../assets/images/icons/Lock.png')),
    send: IconProvider(require('../assets/images/icons/send.svg')),
    sort: IconProvider(require('../assets/images/icons/sort.png')),
    download: IconProvider(require('../assets/images/icons/download.svg')),
    calendar: IconProvider(require('../assets/images/icons/calendar.svg')),
    more: IconProvider(require('../assets/images/icons/more.png')),
    plus: IconProvider(require('../assets/images/icons/plus.png'))
  }
};

export const GdSVGIcons = {
  send: Send,
  send_white: Send_white,
  compose: Compose,
  company: Company,
  download: Download,
  sort: Sort,
  calendar: Calendar,
  more: More,
  incoming: Incoming,
  outgoing: Outgoing,
  search: Search,
  plus: Plus,
  arrowRight: ArrowRight,
  premium: Premium,
  back: Back,
  currency: Currency,
  inventory: Inventory,
  gstr: GSTR,
  purchase: Purchase,
  report: Report,
  settings: Settings,
  discount: Discount,
  notifications: Notifications,
  profile: Profile,
  trigger: Trigger,
  lock: Lock,
  help: Help,
  phone: Phone,
  location: Location,
  gstin: Gstin,
  product: Product
};

export const GdImages = {
  name: 'Gd',
  icons: {
    logo: require('../assets/images/logo2x.png'),
    logoSmall: require('../assets/images/logo.png'),
    logoGiddh: require('../assets/images/giddh.png')
  }
};
