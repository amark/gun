#include <v8.h>
#include <node.h>
#include "reader.h"

using namespace v8;

extern "C" {
    static void init (Handle<Object> target) {
        HandleScope scope;
        hiredis::Reader::Initialize(target);
    }
    NODE_MODULE(hiredis, init);
}
