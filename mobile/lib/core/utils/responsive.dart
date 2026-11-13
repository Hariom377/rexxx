import 'package:flutter/material.dart';

/// REXAM responsive breakpoints:
///   Mobile        : < 600px
///   Tablet        : 600px – 1023px
///   Desktop       : 1024px – 1439px
///   Large Desktop : ≥ 1440px
class Responsive {
  Responsive._();

  // Breakpoint boundaries
  static const double mobileBreakpoint = 600.0;
  static const double tabletBreakpoint = 1024.0;
  static const double largeDesktopBreakpoint = 1440.0;

  // Content max-widths
  static const double maxContentWidth = 1200.0;
  static const double maxDetailWidth = 960.0;
  static const double maxReportWidth = 900.0;
  static const double maxFormWidth = 640.0;
  static const double maxCardWidth = 420.0;

  static bool isMobile(BuildContext context) =>
      MediaQuery.sizeOf(context).width < mobileBreakpoint;

  static bool isTablet(BuildContext context) {
    final w = MediaQuery.sizeOf(context).width;
    return w >= mobileBreakpoint && w < tabletBreakpoint;
  }

  static bool isDesktop(BuildContext context) =>
      MediaQuery.sizeOf(context).width >= tabletBreakpoint;

  static bool isLargeDesktop(BuildContext context) =>
      MediaQuery.sizeOf(context).width >= largeDesktopBreakpoint;

  static bool isTabletOrDesktop(BuildContext context) =>
      MediaQuery.sizeOf(context).width >= mobileBreakpoint;

  /// Returns column count for responsive grid layouts.
  static int columnCount(
    BuildContext context, {
    int mobile = 1,
    int tablet = 2,
    int desktop = 2,
    int largeDesktop = 3,
  }) {
    if (isLargeDesktop(context)) return largeDesktop;
    if (isDesktop(context)) return desktop;
    if (isTablet(context)) return tablet;
    return mobile;
  }

  /// Returns one of four values based on current screen size.
  static T value<T>({
    required BuildContext context,
    required T mobile,
    required T tablet,
    required T desktop,
    T? largeDesktop,
  }) {
    if (largeDesktop != null && isLargeDesktop(context)) return largeDesktop;
    if (isDesktop(context)) return desktop;
    if (isTablet(context)) return tablet;
    return mobile;
  }

  /// Horizontal page padding, responsive.
  static EdgeInsets pagePadding(BuildContext context) {
    if (isLargeDesktop(context)) {
      return const EdgeInsets.symmetric(horizontal: 40, vertical: 28);
    }
    if (isDesktop(context)) {
      return const EdgeInsets.symmetric(horizontal: 32, vertical: 24);
    }
    if (isTablet(context)) {
      return const EdgeInsets.symmetric(horizontal: 24, vertical: 20);
    }
    return const EdgeInsets.symmetric(horizontal: 16, vertical: 16);
  }
}

/// A widget that constrains its child to [Responsive.maxContentWidth] and
/// centers it horizontally. Use this as the root wrapper for each screen body.
class ContentFrame extends StatelessWidget {
  final Widget child;
  final double maxWidth;
  final EdgeInsetsGeometry? padding;
  final AlignmentGeometry alignment;

  const ContentFrame({
    super.key,
    required this.child,
    this.maxWidth = Responsive.maxContentWidth,
    this.padding,
    this.alignment = Alignment.topCenter,
  });

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: alignment,
      child: ConstrainedBox(
        constraints: BoxConstraints(maxWidth: maxWidth),
        child: padding != null
            ? Padding(padding: padding!, child: child)
            : child,
      ),
    );
  }
}
