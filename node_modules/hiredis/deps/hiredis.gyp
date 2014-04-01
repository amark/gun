{
  'targets': [
    {
      'target_name': 'hiredis',
      'type': 'static_library',
      'direct_dependent_settings': {
        'include_dirs': [ '.' ],
      },
      'sources': [
        './hiredis/hiredis.c',
        './hiredis/net.c',
        './hiredis/sds.c',
        './hiredis/async.c',
      ],
      'conditions': [
        ['OS=="mac"', {
          'xcode_settings': {
            'GCC_C_LANGUAGE_STANDARD': 'c99'
          }
        }],
        ['OS=="solaris"', {
          'cflags+': [ '-std=c99' ]
        }]
      ]
    }
  ]
}
