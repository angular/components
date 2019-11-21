# Copyright 2018 The Bazel Authors. All rights reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

"""Pinned browser versions.

This function is here to make browser repositories work with cross-platform RBE.
Unlike the rules_webtesting browser_repositories, this function defines
separate repositories for each platform
"""

load("@io_bazel_rules_webtesting//web/internal:platform_http_file.bzl", _platform_http_file = "platform_http_file")

def platform_http_file(name, licenses, sha256, urls):
    """Platform spepcific browser repository.

    This works around a dificiency in io_bazel_rules_webtesting platform_http_file in that
    it selects the platform when the repository rule is executed. This limits browsers
    tests to run on the local user platform only. For cross-platform RBE we want a repository
    to be defined per platform so the correct one can be selected.
    """

    _platform_http_file(
        name = name,
        amd64_sha256 = sha256,
        amd64_urls = urls,
        licenses = licenses,
        macos_sha256 = sha256,
        macos_urls = urls,
        windows_sha256 = sha256,
        windows_urls = urls,
    )

def browser_repositories():
    """Load pinned rules_webtesting browser versions."""

    ################################################################################
    #                               Chrome Settings                                #
    ################################################################################
    platform_http_file(
        name = "org_chromium_chromium_amd64",
        licenses = ["notice"],  # BSD 3-clause (maybe more?)
        sha256 = "b1e30c4dec8a451f8fe10d1f2d3c71e491d0333425f32247fe5c80a0a354303d",
        urls = ["https://commondatastorage.googleapis.com/chromium-browser-snapshots/Linux_x64/664981/chrome-linux.zip"],
    )

    platform_http_file(
        name = "org_chromium_chromium_macos",
        licenses = ["notice"],  # BSD 3-clause (maybe more?)
        sha256 = "7c0ba93616f44a421330b1c1262e8899fbdf7916bed8b04c775e0426f6f35ec6",
        urls = ["https://commondatastorage.googleapis.com/chromium-browser-snapshots/Mac/665002/chrome-mac.zip"],
    )

    platform_http_file(
        name = "org_chromium_chromium_windows",
        licenses = ["notice"],  # BSD 3-clause (maybe more?)
        sha256 = "f2facd0066270078d0e8999e684595274c359cac3946299a1ceedba2a5de1c63",
        urls = ["https://commondatastorage.googleapis.com/chromium-browser-snapshots/Win/664999/chrome-win.zip"],
    )

    platform_http_file(
        name = "org_chromium_chromedriver_amd64",
        licenses = ["reciprocal"],  # BSD 3-clause, ICU, MPL 1.1, libpng (BSD/MIT-like), Academic Free License v. 2.0, BSD 2-clause, MIT
        sha256 = "0ead02145854b60a3317b59031205b362fb4cfdb680fef20e95c89582e6e38be",
        urls = ["https://commondatastorage.googleapis.com/chromium-browser-snapshots/Linux_x64/664981/chromedriver_linux64.zip"],
    )

    platform_http_file(
        name = "org_chromium_chromedriver_macos",
        licenses = ["reciprocal"],  # BSD 3-clause, ICU, MPL 1.1, libpng (BSD/MIT-like), Academic Free License v. 2.0, BSD 2-clause, MIT
        sha256 = "8dd159e27b13b16262afa6993b15321e736c3b484da363c0e03bb050d72522c9",
        urls = ["https://commondatastorage.googleapis.com/chromium-browser-snapshots/Mac/665002/chromedriver_mac64.zip"],
    )

    platform_http_file(
        name = "org_chromium_chromedriver_windows",
        licenses = ["reciprocal"],  # BSD 3-clause, ICU, MPL 1.1, libpng (BSD/MIT-like), Academic Free License v. 2.0, BSD 2-clause, MIT
        sha256 = "1cc881364974102182257a5c5c2b9cfed513689dee28924ca44df082bdf9fd60",
        urls = ["https://commondatastorage.googleapis.com/chromium-browser-snapshots/Win/664999/chromedriver_win32.zip"],
    )

    ################################################################################
    #                              Firefox Settings                                #
    ################################################################################
    platform_http_file(
        name = "org_mozilla_firefox_amd64",
        licenses = ["notice"],  # MPL 2.0
        sha256 = "284f58b5ee75daec5eaf8c994fe2c8b14aff6c65331e5deeaed6ba650673357c",
        urls = ["https://ftp.mozilla.org/pub/firefox/releases/68.0.2/linux-x86_64/en-US/firefox-68.0.2.tar.bz2"],
    )

    platform_http_file(
        name = "org_mozilla_firefox_macos",
        licenses = ["notice"],  # MPL 2.0
        sha256 = "173440ca6147c6e1eebbe36f332da2c4347e37269152ad55c431f6b0d7078862",
        urls = ["https://ftp.mozilla.org/pub/firefox/releases/68.0.2/mac/en-US/Firefox%2068.0.2.dmg"],
    )

    platform_http_file(
        name = "org_mozilla_geckodriver_amd64",
        licenses = ["reciprocal"],  # MPL 2.0
        sha256 = "03be3d3b16b57e0f3e7e8ba7c1e4bf090620c147e6804f6c6f3203864f5e3784",
        urls = ["https://github.com/mozilla/geckodriver/releases/download/v0.24.0/geckodriver-v0.24.0-linux64.tar.gz"],
    )

    platform_http_file(
        name = "org_mozilla_geckodriver_macos",
        licenses = ["reciprocal"],  # MPL 2.0
        sha256 = "6553195cd6f449e2b90b0bdfe174c6c3337ed571ac6d57a0db028ac5f306cca9",
        urls = ["https://github.com/mozilla/geckodriver/releases/download/v0.24.0/geckodriver-v0.24.0-macos.tar.gz"],
    )
