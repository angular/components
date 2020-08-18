### Zone Task intercepting

Test harnesses currently use ZoneJS for monitoring the application status. The harnesses do this so
that harness interactions with the page are guaranteed on a stabilized Angular application. A
stabilized Angular application does not have any pending microtasks or non-periodic macrotasks
that would cause another round of change detection.

Waiting for those tasks to complete is the goal of our zone task interception. This allows
harnesses to work out of the box without the need of manually calling `fixture.detectChanges()`
multiple times. Also, the harnesses would not able to determine the number of needed change
detection cycles anyway, so the most reasonable and real-application matching behavior is to wait
for the application to stabilize. This matches with the stabilization logic that runs in Protractor.

By default, the harnesses can rely on Angular's `NgZone` for monitoring the status of applications.
The `TestBed` environment can simply call `NgZone.whenStable` to wait for stabilization. In the
protractor environment, the `NgZone` cannot be accessed directly, but there is an API attached
to the browsers `window` global that exposes a subset of the `NgZone`. See
[`Testability`](https://angular.io/api/core/Testability). Protractor uses this API automatically
and waits for the `NgZone` to stabilize (through `Testability`) whenever an arbitrary Selenium
command is invoked. In summary, this means that the `TestBed` and `Protractor` environments match
closely each other in terms of change detection and app stabilization.

All of the basic stabilization monitoring happens as part of the `NgZone` and there already
exist APIs for this. You might ask why we need custom zone interception then. This is because
there can also be tasks that run outside of the Angular zone for performance reasons. Such tasks
are usually scheduled within the `NgZone.runOutsideAngular` method. Since such tasks run outside
of the Angular zone, the `NgZone` does not capture them and the zone appears stable. The harnesses
will not be able to wait for such tasks to complete.

This is not always desirable. There might be harnesses that rely on such tasks to complete. e.g
a component monitors the page directionality but needs to defer any element rectangle computation
until the next tick as browsers take a while to refresh the layout. Such deferring could happen
outside of the Angular zone to avoid unnecessary change detection cycles for the whole application.
A harness for this component, that relies on the element rectangle computation to complete, would
_need_ to wait for the deferred task. As said, the `NgZone` won't capture it intentionally, so we
need to intercept the root zone and wait for it to stabilize. This is _opt-in for harnesses_ as in
most situations, harnesses only rely on the Angular application to stabilize.

Microtasks and non-period macrotasks outside of the Angular zone can be awaited in harnesses
by invoking the `waitForTasksOutsideAngular` method.

### How we implemented the interceptors

The table below shows the Zones that would need to be patched based on combinations of testing
frameworks and platforms the harnesses run within. The table is based on the common setup
for these combinations<sup>1</sup>.

| Framework | TestBed | Selenium/Protractor |
| ---- | ------- | ---------- |
| Jasmine | Proxy Zone or Root Zone | Root Zone |
| Others | Root Zone | Root Zone |

In summary, for e2e tests, the root zone is the only possibility to monitor the task state, and for
unit tests, we can support both the proxy zone and root zone. The benefit of supporting the proxy
zone for TestBed is that users would not need to load the separate root zone patch and harnesses
would work out of the box. Loading the root zone patch is still possible if needed.

<sup>1</sup> There are always exceptions. e.g. The user could always wrap the Angular application
manually in the proxy zone, or even have a custom zone that delegates up to the root zone.

### How is the root zone patched?

The root zone _needs_ to be patched directly after Zone has been loaded. This is a bit unfortunate
as it means that e2e test harness consumers would need to load a separate file, but it is necessary
because if we'd intercept at a later state, we wouldn't know about existing scheduled tasks and our
task state would be incorrect. If ZoneJS would keep track of the task state in the root zone by
default, we would not need to ask users to load a separate file. On the other hand though, in unit
tests, users also need to load the testing ZoneJS bundle anyway, so it's not a lot different.

The only concern is that it makes the harnesses not usable for real production applications as
they could not load the root zone patch script.

### How is the proxy zone patched?

The proxy zone is configured in jasmine TestBed tests automatically by Angular. It can also
be manually configured if desired. The proxy zone already keeps track of its task state, unlike
the root zone, so we can just start intercepting it to watch for changes. Based on this, we can
easily monitor the application stability (with respect to tasks outside of the Angular zone).

No additional file would need to be loaded by harness consumers, except for the standard ZoneJS
testing bundle that is commonly used anyway for TestBed Angular tests (but not necessarily required).


