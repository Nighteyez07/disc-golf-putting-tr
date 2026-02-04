# Haptic Feedback - Browser Compatibility

## Overview
This document outlines the browser support and compatibility status for haptic feedback (Vibration API) in the Disc Golf Putting Trainer app.

## Browser Support Matrix

### Desktop Browsers
| Browser | Version | Support Status | Notes |
|---------|---------|----------------|-------|
| Chrome | 32+ | ✅ Supported | Full support on Windows/Linux |
| Edge | 79+ | ✅ Supported | Full support |
| Firefox | 16+ | ✅ Supported (Android only) | Desktop version has no vibration hardware |
| Safari | Any | ❌ Not Supported | No support on macOS |
| Opera | 19+ | ✅ Supported | Full support on Windows/Linux |

### Mobile Browsers
| Browser | Platform | Version | Support Status | Notes |
|---------|----------|---------|----------------|-------|
| Chrome | Android | 32+ | ✅ **Full Support** | Recommended browser |
| Firefox | Android | 16+ | ✅ **Full Support** | Works well |
| Samsung Internet | Android | 2.0+ | ✅ **Full Support** | Works well |
| Safari | iOS | Any | ⚠️ **Limited/None** | iOS restricts Vibration API |
| Chrome | iOS | Any | ⚠️ **Limited/None** | Uses Safari WebKit, same restrictions |
| Firefox | iOS | Any | ⚠️ **Limited/None** | Uses Safari WebKit, same restrictions |

## iOS Safari Limitations

**Important:** iOS Safari does **not** support the Vibration API due to Apple's platform restrictions:
- The `navigator.vibrate()` method may exist but does not trigger vibration
- This is a known limitation across all iOS browsers (they all use WebKit)
- No workaround is currently available
- The app gracefully degrades on iOS with no errors

**For iOS Users:** 
- Haptic feedback will not work on iPhone or iPad
- All other app features work normally
- Consider using Android devices for full haptic experience

## Technical Requirements

### 1. HTTPS Required
- The Vibration API is only available on secure contexts (HTTPS)
- `localhost` is considered secure for development
- HTTP connections will not have access to `navigator.vibrate()`

### 2. User Activation
- Most modern browsers require user interaction before allowing vibration
- Our implementation triggers vibration on button clicks (user-initiated)
- This ensures compliance with browser security policies

### 3. Browser Permissions
- The Vibration API does not require explicit user permission
- However, device vibration settings must be enabled
- Users can disable vibrations through device settings

## PWA (Progressive Web App) Support

### Android
- ✅ Full support when installed as PWA
- ✅ Works in standalone mode
- ✅ No additional permissions needed

### iOS
- ❌ No support even as PWA
- Platform limitation, not PWA-specific

## Testing Results

### Tested and Working ✅
- **Android Chrome 120+**: Full support, all patterns work
- **Android Firefox 121+**: Full support, all patterns work
- **Desktop Chrome 120+**: API works (but desktop has no vibration motor)
- **Desktop Firefox 122+**: API works (but desktop has no vibration motor)

### Tested and Not Working ❌
- **iOS Safari 17.x**: API not available
- **iOS Chrome 120+**: API not available (uses Safari WebKit)

### Not Tested (Expected to Work) ⚠️
- Samsung Internet Browser (Android)
- Opera Mobile (Android)
- Edge Mobile (Android)

## Implementation Details

### Vibration Patterns Used
```javascript
SINK: [50]                    // Single 50ms pulse
MISS: [30, 30, 30]           // Two 30ms pulses with 30ms gap
PENALTY: [200, 100, 200]     // Longer attention-grabbing pattern
```

### Feature Detection
The app includes automatic feature detection:
```javascript
isHapticsSupported() // Returns true if navigator.vibrate exists
```

### Graceful Degradation
- Settings UI shows "Not supported" when API unavailable
- No errors thrown when vibration fails
- All functionality works without haptics
- Silent fallback for unsupported browsers

## User Settings

Users can control haptic feedback through:
1. **App Settings**: Toggle in Settings dialog (⚙️ icon)
2. **Device Settings**: System-level vibration controls
3. **Browser Permissions**: No explicit permission required

## Performance Impact

- **Minimal CPU usage**: Native browser API is highly optimized
- **Battery impact**: Negligible for short vibrations (<200ms)
- **No blocking**: Vibrations are asynchronous and non-blocking

## Known Issues

1. **iOS Limitation**: Vibration API not supported on any iOS browser
2. **Permission Inconsistency**: Some browsers may require user gesture
3. **Desktop Browsers**: API exists but no vibration hardware

## Recommendations

### For Best Experience
1. **Use Android device** with Chrome or Firefox
2. **Enable HTTPS** for production deployment
3. **Test on actual device** - desktop browsers can't vibrate
4. **Keep patterns short** - long vibrations can be disruptive

### For Developers
1. Always check `isHapticsSupported()` before using
2. Handle vibration failures silently
3. Test on multiple Android devices
4. Don't rely on vibration for critical feedback

## References

- [MDN Vibration API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Vibration_API)
- [Can I Use - Vibration API](https://caniuse.com/vibration)
- [W3C Vibration API Specification](https://www.w3.org/TR/vibration/)

## Version History

- **v1.0.0** (2026-02-04): Initial haptic feedback implementation
  - Added support for Sink, Miss, and Penalty vibrations
  - Settings dialog with toggle control
  - Full graceful degradation for unsupported browsers

## Support

For issues or questions about haptic feedback:
- Check this compatibility document first
- Verify HTTPS is enabled
- Test on Android device for best results
- iOS users: Haptic feedback will not work due to platform limitations
