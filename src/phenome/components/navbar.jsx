import Utils from '../utils/utils';
import Mixins from '../utils/mixins';

import F7NavLeft from './nav-left';
import F7NavTitle from './nav-title';
import F7NavRight from './nav-right';

export default {
  name: 'f7-navbar',
  props: {
    id: [String, Number],
    className: String, // phenome-react-line
    style: Object, // phenome-react-line
    backLink: [Boolean, String],
    backLinkUrl: String,
    backLinkForce: Boolean,
    backLinkShowText: {
      type: Boolean,
      default: undefined,
    },
    sliding: {
      type: Boolean,
      default: true,
    },
    title: String,
    subtitle: String,
    hidden: Boolean,
    noShadow: Boolean,
    noHairline: Boolean,
    innerClass: String,
    innerClassName: String,
    large: Boolean,
    largeTransparent: Boolean,
    transparent: Boolean,
    titleLarge: String,
    ...Mixins.colorProps,
  },
  state() {
    const self = this;
    const $f7 = self.$f7;
    if (!$f7) {
      self.$f7ready(() => {
        self.setState({ _theme: self.$theme });
      });
    }
    return {
      _theme: $f7 ? self.$theme : null,
      routerPositionClass: '',
      largeCollapsed: false,
      routerNavbarRole: null,
      routerNavbarRoleDetailRoot: false,
      routerNavbarMasterStack: false,
      transparentVisible: false,
    };
  },
  render() {
    const self = this;
    const props = self.props;
    const {
      backLink,
      backLinkUrl,
      backLinkForce,
      backLinkShowText,
      sliding,
      title,
      subtitle,
      innerClass,
      innerClassName,
      className,
      id,
      style,
      hidden,
      noShadow,
      noHairline,
      large,
      largeTransparent,
      transparent,
      titleLarge,
    } = props;

    const {
      _theme: theme,
      routerPositionClass,
      largeCollapsed,
      transparentVisible,
    } = self.state;

    let leftEl;
    let titleEl;
    let rightEl;
    let titleLargeEl;

    const addLeftTitleClass = theme && theme.ios && self.$f7 && !self.$f7.params.navbar.iosCenterTitle;
    const addCenterTitleClass = (theme && theme.md && self.$f7 && self.$f7.params.navbar.mdCenterTitle)
      || (theme && theme.aurora && self.$f7 && self.$f7.params.navbar.auroraCenterTitle);

    const slots = self.slots;

    const isLarge = large || largeTransparent;
    const isTransparent = transparent || (isLarge && largeTransparent);
    const isTransparentVisible = isTransparent && transparentVisible;

    const classes = Utils.classNames(
      className,
      'navbar',
      routerPositionClass && routerPositionClass,
      {
        'navbar-hidden': hidden,
        'navbar-large': isLarge,
        'navbar-large-collapsed': isLarge && largeCollapsed,
        'navbar-transparent': isTransparent,
        'navbar-transparent-visible': isTransparentVisible,
        'navbar-master': this.state.routerNavbarRole === 'master',
        'navbar-master-detail': this.state.routerNavbarRole === 'detail',
        'navbar-master-detail-root': this.state.routerNavbarRoleDetailRoot === true,
        'navbar-master-stacked': this.state.routerNavbarMasterStack === true,
        'no-shadow': noShadow,
        'no-hairline': noHairline,
      },
      Mixins.colorClasses(props),
    );

    if (backLink || slots['nav-left'] || slots.left) {
      leftEl = (
        <F7NavLeft
          backLink={backLink}
          backLinkUrl={backLinkUrl}
          backLinkForce={backLinkForce}
          backLinkShowText={backLinkShowText}
          onBackClick={self.onBackClick}
        >{slots['nav-left']}{slots.left}</F7NavLeft>
      );
    }
    if (title || subtitle || slots.title) {
      titleEl = (
        <F7NavTitle
          title={title}
          subtitle={subtitle}
        >{slots.title}</F7NavTitle>
      );
    }
    if (slots['nav-right'] || slots.right) {
      rightEl = (
        <F7NavRight>{slots['nav-right']}{slots.right}</F7NavRight>
      );
    }
    let largeTitle = titleLarge;
    if (!largeTitle && large && title) largeTitle = title;
    if (largeTitle || slots['title-large']) {
      titleLargeEl = (
        <div className="title-large">
          <div className="title-large-text">
            {largeTitle || ''}
            <slot name="title-large" />
          </div>
        </div>
      );
    }
    const innerEl = (
      <div
        className={Utils.classNames(
          'navbar-inner',
          innerClass,
          innerClassName,
          {
            sliding,
            'navbar-inner-left-title': addLeftTitleClass,
            'navbar-inner-centered-title': addCenterTitleClass,
          }
        )}
      >
        {leftEl}
        {titleEl}
        {rightEl}
        {titleLargeEl}
        <slot />
      </div>
    );

    return (
      <div ref="el" id={id} style={style} className={classes}>
        <div className="navbar-bg" />
        <slot name="before-inner" />
        {innerEl}
        <slot name="after-inner" />
      </div>
    );
  },
  componentDidCreate() {
    Utils.bindMethods(this, ['onBackClick', 'onHide', 'onShow', 'onExpand', 'onCollapse', 'onNavbarPosition', 'onNavbarRole', 'onNavbarMasterStack', 'onNavbarMasterUnstack', 'onTransparentHide', 'onTransparentShow']);
  },
  componentDidMount() {
    const self = this;
    const { el } = self.refs;
    if (!el) return;
    self.$f7ready((f7) => {
      self.eventTargetEl = el;

      f7.on('navbarShow', self.onShow);
      f7.on('navbarHide', self.onHide);
      f7.on('navbarCollapse', self.onCollapse);
      f7.on('navbarExpand', self.onExpand);
      f7.on('navbarPosition', self.onNavbarPosition);
      f7.on('navbarRole', self.onNavbarRole);
      f7.on('navbarMasterStack', self.onNavbarMasterStack);
      f7.on('navbarMasterUnstack', self.onNavbarMasterUnstack);
      f7.on('navbarTransparentShow', self.onNavbarTransparentShow);
      f7.on('navbarTransparentHide', self.onNavbarTransparentHide);
    });
  },
  componentDidUpdate() {
    const self = this;
    if (!self.$f7) return;
    const el = self.refs.el;
    self.$f7.navbar.size(el);
  },
  componentWillUnmount() {
    const self = this;
    const { el } = self.refs;
    if (!el || !self.$f7) return;
    const f7 = self.$f7;
    f7.off('navbarShow', self.onShow);
    f7.off('navbarHide', self.onHide);
    f7.off('navbarCollapse', self.onCollapse);
    f7.off('navbarExpand', self.onExpand);
    f7.off('navbarPosition', self.onNavbarPosition);
    f7.off('navbarRole', self.onNavbarRole);
    f7.off('navbarMasterStack', self.onNavbarMasterStack);
    f7.off('navbarMasterUnstack', self.onNavbarMasterUnstack);
    f7.off('navbarTransparentShow', self.onNavbarTransparentShow);
    f7.off('navbarTransparentHide', self.onNavbarTransparentHide);
    self.eventTargetEl = null;
    delete self.eventTargetEl;
  },
  methods: {
    onHide(navbarEl) {
      if (this.eventTargetEl !== navbarEl) return;
      this.dispatchEvent('navbar:hide navbarHide');
    },
    onShow(navbarEl) {
      if (this.eventTargetEl !== navbarEl) return;
      this.dispatchEvent('navbar:show navbarShow');
    },
    onExpand(navbarEl) {
      if (this.eventTargetEl !== navbarEl) return;
      this.setState({
        largeCollapsed: false,
      });
      this.dispatchEvent('navbar:expand navbarExpand');
    },
    onCollapse(navbarEl) {
      if (this.eventTargetEl !== navbarEl) return;
      this.setState({
        largeCollapsed: true,
      });
      this.dispatchEvent('navbar:collapse navbarCollapse');
    },
    onNavbarTransparentShow(navbarEl) {
      if (this.eventTargetEl !== navbarEl) return;
      this.setState({
        transparentVisible: true,
      });
      this.dispatchEvent('navbar:transparentshow navbarTransparentShow');
    },
    onNavbarTransparentHide(navbarEl) {
      if (this.eventTargetEl !== navbarEl) return;
      this.setState({
        transparentVisible: false,
      });
      this.dispatchEvent('navbar:transparenthide navbarTransparentHide');
    },
    onNavbarPosition(navbarEl, position) {
      if (this.eventTargetEl !== navbarEl) return;
      this.setState({
        routerPositionClass: position ? `navbar-${position}` : '',
      });
    },
    onNavbarRole(navbarEl, rolesData) {
      if (this.eventTargetEl !== navbarEl) return;
      this.setState({
        routerNavbarRole: rolesData.role,
        routerNavbarRoleDetailRoot: rolesData.detailRoot,
      });
    },
    onNavbarMasterStack(navbarEl) {
      if (this.eventTargetEl !== navbarEl) return;
      this.setState({
        routerNavbarMasterStack: true,
      });
    },
    onNavbarMasterUnstack(navbarEl) {
      if (this.eventTargetEl !== navbarEl) return;
      this.setState({
        routerNavbarMasterStack: false,
      });
    },
    hide(animate) {
      const self = this;
      if (!self.$f7) return;
      self.$f7.navbar.hide(self.refs.el, animate);
    },
    show(animate) {
      const self = this;
      if (!self.$f7) return;
      self.$f7.navbar.show(self.refs.el, animate);
    },
    size() {
      const self = this;
      if (!self.$f7) return;
      self.$f7.navbar.size(self.refs.el);
    },
    onBackClick(event) {
      this.dispatchEvent('back-click backClick click:back clickBack', event);
    },
  },
};
