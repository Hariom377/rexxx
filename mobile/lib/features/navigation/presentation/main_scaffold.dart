import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_dimensions.dart';
import '../../../core/constants/branding.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/utils/responsive.dart';

// ─────────────────────────────────────────────────────────────────────────────
// Navigation item model
// ─────────────────────────────────────────────────────────────────────────────
class _NavItem {
  final String path;
  final IconData icon;
  final IconData activeIcon;
  final String label;
  const _NavItem({
    required this.path,
    required this.icon,
    required this.activeIcon,
    required this.label,
  });
}

const _navItems = [
  _NavItem(
    path: '/discover',
    icon: LucideIcons.home,
    activeIcon: LucideIcons.home,
    label: 'Home',
  ),
  _NavItem(
    path: '/explorer',
    icon: LucideIcons.compass,
    activeIcon: LucideIcons.compass,
    label: 'Explore',
  ),
  _NavItem(
    path: '/saved',
    icon: LucideIcons.bookmark,
    activeIcon: LucideIcons.bookmark,
    label: 'Saved',
  ),
  _NavItem(
    path: '/applications',
    icon: LucideIcons.clipboardList,
    activeIcon: LucideIcons.clipboardList,
    label: 'Applied',
  ),
  _NavItem(
    path: '/profile',
    icon: LucideIcons.user,
    activeIcon: LucideIcons.user,
    label: 'Profile',
  ),
];

// ─────────────────────────────────────────────────────────────────────────────
// MainScaffold — adaptive navigation shell
// ─────────────────────────────────────────────────────────────────────────────
class MainScaffold extends ConsumerStatefulWidget {
  final Widget child;

  const MainScaffold({super.key, required this.child});

  @override
  ConsumerState<MainScaffold> createState() => _MainScaffoldState();
}

class _MainScaffoldState extends ConsumerState<MainScaffold> {
  DateTime? _lastBackPressed;

  int _selectedIndex(BuildContext context) {
    final location = GoRouterState.of(context).matchedLocation;
    for (int i = 0; i < _navItems.length; i++) {
      if (location.startsWith(_navItems[i].path)) return i;
    }
    return 0;
  }

  void _navigate(int index, BuildContext context) {
    context.go(_navItems[index].path);
  }

  @override
  Widget build(BuildContext context) {
    final selectedIndex = _selectedIndex(context);
    final isDesktop = Responsive.isDesktop(context);
    final isTablet = Responsive.isTablet(context);

    if (isDesktop) {
      return _DesktopScaffold(
        selectedIndex: selectedIndex,
        onNavigate: (i) => _navigate(i, context),
        child: widget.child,
      );
    }

    if (isTablet) {
      return _TabletScaffold(
        selectedIndex: selectedIndex,
        onNavigate: (i) => _navigate(i, context),
        child: widget.child,
      );
    }

    // Mobile layout with Android back-press handling
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, result) {
        if (didPop) return;

        if (selectedIndex != 0) {
          context.go('/discover');
        } else {
          final now = DateTime.now();
          if (_lastBackPressed == null ||
              now.difference(_lastBackPressed!) > const Duration(seconds: 2)) {
            _lastBackPressed = now;
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: const Text(
                  'Press back again to exit Rexam',
                  style: TextStyle(color: AppColors.primaryText),
                ),
                duration: const Duration(seconds: 2),
                backgroundColor: AppColors.elevatedSurface,
                behavior: SnackBarBehavior.floating,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                  side: const BorderSide(color: AppColors.border),
                ),
              ),
            );
          } else {
            // On web, SystemNavigator.pop() is a no-op — harmless
            if (!kIsWeb) SystemNavigator.pop();
          }
        }
      },
      child: _MobileScaffold(
        selectedIndex: selectedIndex,
        onNavigate: (i) => _navigate(i, context),
        child: widget.child,
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Mobile scaffold — bottom navigation bar
// ─────────────────────────────────────────────────────────────────────────────
class _MobileScaffold extends StatelessWidget {
  final int selectedIndex;
  final void Function(int) onNavigate;
  final Widget child;

  const _MobileScaffold({
    required this.selectedIndex,
    required this.onNavigate,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: context.themeBackground,
      body: child,
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: context.isDarkMode
              ? AppColors.secondaryBackground
              : AppColors.lightBackground,
          border: Border(
            top: BorderSide(color: context.themeBorder, width: 1.0),
          ),
        ),
        child: SafeArea(
          child: SizedBox(
            height: AppDimensions.navBarHeight,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: List.generate(
                _navItems.length,
                (i) => _MobileNavItem(
                  item: _navItems[i],
                  isSelected: i == selectedIndex,
                  onTap: () => onNavigate(i),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _MobileNavItem extends StatelessWidget {
  final _NavItem item;
  final bool isSelected;
  final VoidCallback onTap;

  const _MobileNavItem({
    required this.item,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: InkWell(
        onTap: onTap,
        splashColor: Colors.transparent,
        highlightColor: Colors.transparent,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
              decoration: BoxDecoration(
                color: isSelected
                    ? (context.isDarkMode
                        ? AppColors.elevatedSurface
                        : AppColors.lightSurfaceElevated)
                    : Colors.transparent,
                borderRadius: BorderRadius.circular(16),
                border: isSelected
                    ? Border.all(color: context.themeBorder, width: 1.0)
                    : null,
              ),
              child: Icon(
                item.icon,
                size: 20,
                color: isSelected
                    ? (context.isDarkMode ? AppColors.white : AppColors.black)
                    : (context.isDarkMode
                        ? AppColors.mutedText
                        : AppColors.lightTextSubtle),
              ),
            ),
            const SizedBox(height: 2),
            Text(
              item.label,
              style: AppTypography.caption.copyWith(
                fontSize: 11,
                fontWeight:
                    isSelected ? FontWeight.w700 : FontWeight.w500,
                color: isSelected
                    ? (context.isDarkMode ? AppColors.white : AppColors.black)
                    : (context.isDarkMode
                        ? AppColors.mutedText
                        : AppColors.lightTextSubtle),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Tablet scaffold — NavigationRail on the left
// ─────────────────────────────────────────────────────────────────────────────
class _TabletScaffold extends StatelessWidget {
  final int selectedIndex;
  final void Function(int) onNavigate;
  final Widget child;

  const _TabletScaffold({
    required this.selectedIndex,
    required this.onNavigate,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = context.isDarkMode;
    final railBg = isDark ? AppColors.secondaryBackground : AppColors.lightBackground;
    final selectedColor = isDark ? AppColors.white : AppColors.black;
    final unselectedColor = isDark ? AppColors.mutedText : AppColors.lightTextSubtle;

    return Scaffold(
      backgroundColor: context.themeBackground,
      body: Row(
        children: [
          // Navigation rail
          Container(
            decoration: BoxDecoration(
              color: railBg,
              border: Border(
                right: BorderSide(color: context.themeBorder, width: 1.0),
              ),
            ),
            child: SafeArea(
              child: NavigationRail(
                backgroundColor: railBg,
                selectedIndex: selectedIndex,
                onDestinationSelected: onNavigate,
                labelType: NavigationRailLabelType.all,
                useIndicator: true,
                indicatorColor: isDark
                    ? AppColors.elevatedSurface
                    : AppColors.lightSurfaceElevated,
                selectedIconTheme: IconThemeData(color: selectedColor, size: 20),
                unselectedIconTheme: IconThemeData(color: unselectedColor, size: 20),
                selectedLabelTextStyle: TextStyle(
                  color: selectedColor,
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                ),
                unselectedLabelTextStyle: TextStyle(
                  color: unselectedColor,
                  fontSize: 11,
                  fontWeight: FontWeight.w500,
                ),
                leading: Padding(
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  child: AppBranding.logoImage(size: 28),
                ),
                destinations: _navItems
                    .map((item) => NavigationRailDestination(
                          icon: Icon(item.icon),
                          selectedIcon: Icon(item.activeIcon),
                          label: Text(item.label),
                        ))
                    .toList(),
              ),
            ),
          ),
          // Main content
          Expanded(child: child),
        ],
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Desktop scaffold — persistent sidebar with header + main content
// ─────────────────────────────────────────────────────────────────────────────
class _DesktopScaffold extends StatelessWidget {
  final int selectedIndex;
  final void Function(int) onNavigate;
  final Widget child;

  const _DesktopScaffold({
    required this.selectedIndex,
    required this.onNavigate,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: context.themeBackground,
      body: Row(
        children: [
          _DesktopSidebar(
            selectedIndex: selectedIndex,
            onNavigate: onNavigate,
          ),
          // Vertical divider
          Container(
            width: 1,
            color: context.themeBorder,
          ),
          // Main content area
          Expanded(child: child),
        ],
      ),
    );
  }
}

class _DesktopSidebar extends StatelessWidget {
  final int selectedIndex;
  final void Function(int) onNavigate;

  const _DesktopSidebar({
    required this.selectedIndex,
    required this.onNavigate,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = context.isDarkMode;
    final sidebarBg = isDark ? AppColors.secondaryBackground : AppColors.lightBackground;

    return Container(
      width: 220,
      color: sidebarBg,
      child: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Brand header
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 24),
              child: Row(
                children: [
                  AppBranding.logoImage(size: 28),
                  const SizedBox(width: 10),
                  Text(
                    AppBranding.brandName,
                    style: TextStyle(
                      color: isDark ? AppColors.primaryText : AppColors.lightTextMain,
                      fontSize: 16,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 0.5,
                    ),
                  ),
                ],
              ),
            ),

            // Nav section header
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 0, 20, 8),
              child: Text(
                'MENU',
                style: TextStyle(
                  color: isDark ? AppColors.mutedText : AppColors.lightTextSubtle,
                  fontSize: 10,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 1.2,
                ),
              ),
            ),

            // Nav items
            ...List.generate(
              _navItems.length,
              (i) => _SidebarItem(
                item: _navItems[i],
                isSelected: i == selectedIndex,
                onTap: () => onNavigate(i),
              ),
            ),

            const Spacer(),

            // Settings link at bottom
            const Divider(height: 1),
            const SizedBox(height: 8),
            _SidebarActionItem(
              icon: LucideIcons.settings,
              label: 'Settings',
              onTap: () => context.push('/settings'),
            ),
            _SidebarActionItem(
              icon: LucideIcons.bell,
              label: 'Alerts',
              onTap: () => context.push('/alerts'),
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }
}

class _SidebarItem extends StatelessWidget {
  final _NavItem item;
  final bool isSelected;
  final VoidCallback onTap;

  const _SidebarItem({
    required this.item,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = context.isDarkMode;
    final selectedTextColor = isDark ? AppColors.white : AppColors.black;
    final unselectedTextColor =
        isDark ? AppColors.secondaryText : AppColors.lightTextMuted;
    final selectedBg =
        isDark ? AppColors.elevatedSurface : AppColors.lightSurfaceElevated;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 2),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(10),
        child: InkWell(
          borderRadius: BorderRadius.circular(10),
          onTap: onTap,
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 150),
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            decoration: BoxDecoration(
              color: isSelected ? selectedBg : Colors.transparent,
              borderRadius: BorderRadius.circular(10),
              border: isSelected
                  ? Border.all(color: context.themeBorder, width: 1.0)
                  : null,
            ),
            child: Row(
              children: [
                Icon(
                  item.icon,
                  size: 18,
                  color: isSelected ? selectedTextColor : unselectedTextColor,
                ),
                const SizedBox(width: 12),
                Text(
                  item.label,
                  style: TextStyle(
                    color: isSelected ? selectedTextColor : unselectedTextColor,
                    fontSize: 13.5,
                    fontWeight:
                        isSelected ? FontWeight.w700 : FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _SidebarActionItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  const _SidebarActionItem({
    required this.icon,
    required this.label,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = context.isDarkMode;
    final textColor = isDark ? AppColors.secondaryText : AppColors.lightTextMuted;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 2),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(10),
        child: InkWell(
          borderRadius: BorderRadius.circular(10),
          onTap: onTap,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            child: Row(
              children: [
                Icon(icon, size: 18, color: textColor),
                const SizedBox(width: 12),
                Text(
                  label,
                  style: TextStyle(
                    color: textColor,
                    fontSize: 13.5,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
