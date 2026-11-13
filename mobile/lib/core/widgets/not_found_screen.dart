import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../constants/app_colors.dart';
import '../constants/app_dimensions.dart';
import '../theme/app_typography.dart';
import '../utils/responsive.dart';
import '../../shared/rexam_wordmark.dart';

class NotFoundScreen extends StatelessWidget {
  final Exception? error;

  const NotFoundScreen({super.key, this.error});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: context.themeBackground,
      body: SafeArea(
        child: Center(
          child: ContentFrame(
            maxWidth: Responsive.maxFormWidth,
            child: Padding(
              padding: const EdgeInsets.all(AppDimensions.space24),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const RexamWordmark(fontSize: 24),
                  const SizedBox(height: AppDimensions.space32),
                  Container(
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      color: context.themeCard,
                      borderRadius: BorderRadius.circular(AppDimensions.radiusCard),
                      border: Border.all(color: context.themeBorder),
                    ),
                    child: Column(
                      children: [
                        const Icon(
                          LucideIcons.compass,
                          size: 48,
                          color: AppColors.primaryGreen,
                        ),
                        const SizedBox(height: AppDimensions.space16),
                        Text(
                          'Page Not Found (404)',
                          style: AppTypography.screenTitle.copyWith(
                            fontSize: 20,
                            color: context.themeTextMain,
                          ),
                        ),
                        const SizedBox(height: AppDimensions.space8),
                        Text(
                          'The page or resource you are looking for does not exist or has been relocated.',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            color: context.themeTextMuted,
                            fontSize: 13,
                            height: 1.5,
                          ),
                        ),
                        if (error != null) ...[
                          const SizedBox(height: AppDimensions.space12),
                          Text(
                            error.toString(),
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              color: context.themeTextSubtle,
                              fontSize: 11,
                              fontFamily: 'monospace',
                            ),
                          ),
                        ],
                        const SizedBox(height: AppDimensions.space24),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            OutlinedButton.icon(
                              onPressed: () {
                                if (context.canPop()) {
                                  context.pop();
                                } else {
                                  context.go('/discover');
                                }
                              },
                              icon: const Icon(LucideIcons.arrowLeft, size: 16),
                              label: const Text('Go Back'),
                              style: OutlinedButton.styleFrom(
                                side: BorderSide(color: context.themeBorder),
                                foregroundColor: context.themeTextMain,
                              ),
                            ),
                            const SizedBox(width: AppDimensions.space12),
                            ElevatedButton.icon(
                              onPressed: () => context.go('/discover'),
                              icon: const Icon(LucideIcons.home, size: 16),
                              label: const Text('Home'),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: context.isDarkMode ? AppColors.white : AppColors.black,
                                foregroundColor: context.isDarkMode ? AppColors.black : AppColors.white,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
