import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/supabase_client.dart';
import '../providers/auth_provider.dart';

/// Handles the OAuth redirect callback on web.
///
/// When Supabase OAuth redirects back to /auth/callback, this screen:
/// 1. Waits for the Supabase session to settle (via onAuthStateChange)
/// 2. Checks the URL hash/query for error parameters
/// 3. Navigates to /discover (authenticated) or /auth (error)
///
/// On Android, deep-links handle this differently — this screen is never shown.
class AuthCallbackScreen extends ConsumerStatefulWidget {
  const AuthCallbackScreen({super.key});

  @override
  ConsumerState<AuthCallbackScreen> createState() => _AuthCallbackScreenState();
}

class _AuthCallbackScreenState extends ConsumerState<AuthCallbackScreen> {
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _handleCallback();
  }

  Future<void> _handleCallback() async {
    // Give Supabase a moment to process the OAuth tokens from the URL fragment.
    await Future.delayed(const Duration(milliseconds: 500));

    if (!mounted) return;

    final client = SupabaseConfig.client;
    if (client == null) {
      setState(() => _errorMessage = 'Could not connect to authentication service.');
      return;
    }

    // Supabase Flutter SDK automatically extracts the token from the URL hash
    // when the app is loaded on web. We just need to wait for session to be set.
    // Listen to auth state to know when session is ready.
    final sub = client.auth.onAuthStateChange.listen((data) async {
      if (!mounted) return;
      final event = data.event;
      if (event == AuthChangeEvent.signedIn || event == AuthChangeEvent.userUpdated) {
        // Refresh auth provider state so the router redirect logic fires correctly.
        await ref.read(authProvider.notifier).checkInitialSession();
        if (mounted) context.go('/discover');
      } else if (event == AuthChangeEvent.signedOut) {
        if (mounted) context.go('/auth');
      }
    });

    // Fallback: if already authenticated (e.g. session was set synchronously),
    // navigate immediately.
    await Future.delayed(const Duration(seconds: 3));
    if (mounted) {
      final currentUser = client.auth.currentUser;
      if (currentUser != null) {
        await ref.read(authProvider.notifier).checkInitialSession();
        if (mounted) context.go('/discover');
      } else {
        sub.cancel();
        if (mounted) {
          setState(() => _errorMessage = 'Authentication could not be completed. Please try again.');
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.mainBackground,
      body: Center(
        child: _errorMessage != null
            ? _ErrorState(
                message: _errorMessage!,
                onRetry: () => context.go('/auth'),
              )
            : const _LoadingState(),
      ),
    );
  }
}

class _LoadingState extends StatelessWidget {
  const _LoadingState();

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        const SizedBox(
          width: 32,
          height: 32,
          child: CircularProgressIndicator(
            strokeWidth: 2,
            valueColor: AlwaysStoppedAnimation<Color>(AppColors.primaryGreen),
          ),
        ),
        const SizedBox(height: 20),
        Text(
          'Completing sign in…',
          style: TextStyle(
            color: AppColors.secondaryText,
            fontSize: 14,
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }
}

class _ErrorState extends StatelessWidget {
  final String message;
  final VoidCallback onRetry;

  const _ErrorState({required this.message, required this.onRetry});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(32),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.error_outline, color: AppColors.error, size: 40),
          const SizedBox(height: 16),
          Text(
            message,
            textAlign: TextAlign.center,
            style: const TextStyle(
              color: AppColors.secondaryText,
              fontSize: 14,
            ),
          ),
          const SizedBox(height: 24),
          ElevatedButton(
            onPressed: onRetry,
            child: const Text('Back to Sign In'),
          ),
        ],
      ),
    );
  }
}
