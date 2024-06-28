#include <stdio.h>
#include <emscripten/emscripten.h>

int main( void ) {
  printf("Hello World\n");
  return 0;
}

#ifdef __cplusplus
#define EXTERN extern "C"
#else
#define EXTERN
#endif

EXTERN EMSCRIPTEN_KEEPALIVE void myFunction( void ) {
  printf("MyFunction Called\n");
}

