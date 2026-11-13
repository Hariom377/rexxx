import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_web_plugins/url_strategy.dart';

import 'core/services/notification_service.dart';
import 'core/supabase_client.dart';
import 'app/app.dart';

export 'app/app.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Enable clean URL routing (removes the '#' from web URLs: /discover not /#/discover)
  usePathUrlStrategy();

  await SupabaseConfig.initialize();

  // Local notifications are not supported on web — skipped safely
  if (!kIsWeb) {
    await NotificationService().initialize();
  }

  runApp(
    const ProviderScope(
      child: RexamApp(),
    ),
  );
}
